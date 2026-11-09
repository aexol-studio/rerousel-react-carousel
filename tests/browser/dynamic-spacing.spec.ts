import { expect, test } from '@playwright/test';

test('autoplay starts when a slide margin makes previously fitting content overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/tests/fixture.html?loop=false&auto=true&count=2&interval=500&hover=false');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });

  await expect.poll(() => carousel.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
  await page.waitForTimeout(650);
  expect(await carousel.evaluate((el) => el.scrollLeft)).toBe(0);

  await page.locator('[data-slide="0"]').evaluate((slide) => {
    slide.style.marginInlineEnd = '220px';
  });
  expect(await carousel.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(100);
  await expect.poll(() => carousel.evaluate((el) => el.scrollLeft), { timeout: 3000 }).toBeGreaterThan(100);
});

test('nested content and style updates do not keep resetting the autoplay interval', async ({ page }) => {
  await page.goto('/tests/fixture.html?loop=false&auto=true&interval=700&hover=false');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const timer = await carousel.evaluate((el) => {
    const heading = el.querySelector('h2')!;
    const input = el.querySelector('input')!;
    let updates = 0;
    return window.setInterval(() => {
      updates++;
      heading.textContent = updates % 2 ? 'Slide A' : 'Slide B';
      input.style.color = updates % 2 ? 'black' : 'navy';
      el.dataset.nestedUpdates = String(updates);
    }, 80);
  });

  try {
    await expect
      .poll(() => carousel.evaluate((el) => Math.abs(el.scrollLeft)), { timeout: 2200 })
      .toBeGreaterThan(100);
    expect(Number(await carousel.getAttribute('data-nested-updates'))).toBeGreaterThan(5);
  } finally {
    await page.evaluate((id) => window.clearInterval(id), timer);
  }
});

type MotionEvent = { kind: 'advance' | 'settled' | 'pressed' | 'released'; time: number };
type TrackedCarousel = HTMLElement & { motionEvents: MotionEvent[] };

test('autoplay gives a native touch flick a complete interval after momentum settles', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(browserName !== 'chromium', 'Native CDP touch dispatch is Chromium-specific.');
  const interval = 150;
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`/tests/fixture.html?loop=false&auto=true&interval=${interval}&hover=false`);
    const carousel = page.getByRole('region', { name: 'Fixture carousel' });
    await carousel.evaluate((element) => {
      const el = element as TrackedCarousel;
      el.motionEvents = [];
      const original = el.scrollTo;
      el.scrollTo = (...args: [options?: ScrollToOptions] | [x: number, y: number]) => {
        el.motionEvents.push({ kind: 'advance', time: performance.now() });
        Reflect.apply(original, el, args);
      };
      el.addEventListener('scrollend', () => {
        el.motionEvents.push({ kind: 'settled', time: performance.now() });
      });
    });
    const box = await carousel.boundingBox();
    if (!box) throw new Error('Missing carousel');
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 320, y: box.y + 12 }],
    });
    await carousel.evaluate((el) => {
      (el as TrackedCarousel).motionEvents.push({ kind: 'pressed', time: performance.now() });
    });
    await page.waitForTimeout(200);
    for (const x of [280, 220, 150, 70]) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: box.y + 12 }],
      });
      await page.waitForTimeout(15);
    }
    await carousel.evaluate((el) => {
      (el as TrackedCarousel).motionEvents.push({ kind: 'released', time: performance.now() });
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect
      .poll(
        () =>
          carousel.evaluate((el) => {
            const events = (el as TrackedCarousel).motionEvents;
            const released = events.find((event) => event.kind === 'released')!;
            return events.some((event) => event.kind === 'advance' && event.time > released.time);
          }),
        { timeout: 5000 },
      )
      .toBe(true);

    const events = await carousel.evaluate((el) => (el as TrackedCarousel).motionEvents);
    const pressed = events.find((event) => event.kind === 'pressed')!;
    const released = events.find((event) => event.kind === 'released')!;
    expect(
      events.filter(
        (event) => event.kind === 'advance' && event.time > pressed.time && event.time < released.time,
      ),
    ).toHaveLength(0);
    const advance = events.find((event) => event.kind === 'advance' && event.time > released.time)!;
    const settled = events
      .filter((event) => event.kind === 'settled' && event.time > released.time && event.time < advance.time)
      .pop();
    expect(settled, 'A native scrollend must precede the next automatic advance').toBeDefined();
    expect(advance.time - settled!.time).toBeGreaterThanOrEqual(interval - 20);
  } finally {
    await context.close();
  }
});
