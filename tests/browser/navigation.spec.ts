import { expect, test, type Locator } from '@playwright/test';

async function geometry(carousel: Locator) {
  return carousel.evaluate((el) => {
    const maximum = Math.max(0, el.scrollWidth - el.clientWidth);
    const style = getComputedStyle(el);
    const rtl = style.direction === 'rtl';
    const slides = Array.from(el.children) as HTMLElement[];
    const padding =
      (parseFloat(style.scrollPaddingInlineStart) || 0) *
      (style.scrollPaddingInlineStart.endsWith('%') ? el.clientWidth / 100 : 1);
    const stops = slides.length
      ? slides.map((slide) =>
          Math.min(
            maximum,
            Math.max(
              0,
              (rtl ? el.clientWidth - slide.offsetLeft - slide.offsetWidth : slide.offsetLeft) - padding,
            ),
          ),
        )
      : [0];
    return { position: Math.abs(el.scrollLeft), maximum, stops: [...new Set([...stops, maximum])] };
  });
}

async function expectPosition(carousel: Locator, expected: number) {
  await expect.poll(async () => Math.abs((await geometry(carousel)).position - expected)).toBeLessThan(1);
  // A transient animation frame at the expected offset must not hide a later snap correction.
  await carousel.page().waitForTimeout(100);
  expect(Math.abs((await geometry(carousel)).position - expected)).toBeLessThan(1);
}

for (const direction of ['ltr', 'rtl']) {
  test(`unequal slides complete exact forward and backward cycles in ${direction}`, async ({ page }) => {
    await page.goto(`/tests/fixture.html?rtl=${direction === 'rtl'}`);
    const carousel = page.getByRole('region', { name: 'Fixture carousel' });
    const { stops } = await geometry(carousel);
    await page.getByLabel('Note 0').fill('One live input');
    await page.getByLabel('Note 0').evaluate((el) => {
      el.dataset.identity = 'original';
    });
    await page.getByRole('button', { name: 'Count 0: 0' }).click();

    for (let cycle = 0; cycle < 2; cycle++) {
      for (const stop of [...stops.slice(1), 0]) {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expectPosition(carousel, stop);
      }
      for (const stop of [...stops.slice(1)].reverse().concat(0)) {
        await page.getByRole('button', { name: 'Previous', exact: true }).click();
        await expectPosition(carousel, stop);
      }
    }
    await expect(page.locator('[data-slide]')).toHaveCount(4);
    await expect(page.locator('#note-0')).toHaveCount(1);
    await expect(page.getByLabel('Note 0')).toHaveValue('One live input');
    await expect(page.getByLabel('Note 0')).toHaveAttribute('data-identity', 'original');
    await expect(page.getByRole('button', { name: 'Count 0: 1' })).toBeVisible();
  });

  test(`padded ${direction} viewports honor native snap positions and wrap backward`, async ({ page }) => {
    for (const padding of ['0px', '20px', '5%']) {
      await page.goto(`/tests/fixture.html?rtl=${direction === 'rtl'}&behavior=instant`);
      const carousel = page.getByRole('region', { name: 'Fixture carousel' });
      await carousel.evaluate((el, padding) => {
        el.style.paddingInline = '20px';
        el.style.scrollPaddingInlineStart = padding;
      }, padding);
      const { stops } = await geometry(carousel);
      await carousel.focus();
      await page.keyboard.press('Home');
      await expectPosition(carousel, stops[0]);
      for (const expected of [...stops.slice(1), stops[0]]) {
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await expectPosition(carousel, expected);
      }
      for (const expected of [...stops.slice(1)].reverse().concat(stops[0])) {
        await page.getByRole('button', { name: 'Previous', exact: true }).click();
        await expectPosition(carousel, expected);
      }
    }
  });
}

test('rapid commands advance from the requested destination and can reverse before settling', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const { stops } = await geometry(carousel);
  const next = page.getByRole('button', { name: 'Next', exact: true });
  await next.click({ clickCount: 2, delay: 30 });
  await expectPosition(carousel, stops[2]);

  await carousel.focus();
  await page.keyboard.press('Home');
  await expectPosition(carousel, 0);
  await page.locator('.controls').evaluate((controls) => {
    const [previous, next] = Array.from(controls.querySelectorAll('button'));
    next.click();
    next.click();
    previous.click();
  });
  await expectPosition(carousel, stops[1]);
});

test('fixed distances advance without native snap canceling or changing the requested step', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?itemWidth=100');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  for (const expected of [100, 200, 300]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectPosition(carousel, expected);
  }
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await expectPosition(carousel, 200);
});

test('instant behavior overrides CSS smooth scrolling at both boundaries', async ({ page }) => {
  await page.goto('/tests/fixture.html?behavior=instant&cssSmooth=true');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const { maximum } = await geometry(carousel);
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  expect((await geometry(carousel)).position).toBeCloseTo(maximum, 0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  expect((await geometry(carousel)).position).toBe(0);
});

test('fractional slide widths and gaps do not strand navigation between snap points', async ({ page }) => {
  await page.goto('/tests/fixture.html?gap=16.6');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await carousel.evaluate((el) => {
    Array.from(el.children).forEach((slide, index) => {
      (slide as HTMLElement).style.width = `${[240.4, 300.6, 260.8, 240.2][index]}px`;
    });
  });
  const { stops } = await geometry(carousel);
  for (const expected of [...stops.slice(1), 0]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectPosition(carousel, expected);
  }
  for (const expected of [...stops.slice(1)].reverse().concat(0)) {
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await expectPosition(carousel, expected);
  }
});

test('manual scrolling and resize replace the previous navigation destination', async ({ page }) => {
  await page.goto('/tests/fixture.html?behavior=instant');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await carousel.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
  await expectPosition(carousel, (await geometry(carousel)).maximum);
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  let { stops } = await geometry(carousel);
  await expectPosition(carousel, stops[stops.length - 2]);

  await page.getByRole('button', { name: 'Resize', exact: true }).click();
  await carousel.focus();
  await page.keyboard.press('End');
  await page.getByRole('button', { name: 'Remove slide' }).click();
  await expect(page.locator('[data-slide]')).toHaveCount(3);
  ({ stops } = await geometry(carousel));
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expectPosition(carousel, 0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expectPosition(carousel, stops[1] ?? 0);
});

test('autoplay completes a full loop and leaves a full reading interval after each arrival', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?auto=true&interval=300&hover=false');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const { stops } = await geometry(carousel);
  await carousel.evaluate((el) => {
    const arrivals: { position: number; start: number; end: number }[] = [];
    let start: number | undefined;
    el.addEventListener('scroll', () => {
      start ??= performance.now();
    });
    el.addEventListener('scrollend', () => {
      if (start !== undefined) {
        arrivals.push({ position: Math.abs(el.scrollLeft), start, end: performance.now() });
        el.dataset.arrivals = JSON.stringify(arrivals);
        start = undefined;
      }
    });
  });
  await expect
    .poll(async () => carousel.evaluate((el) => JSON.parse(el.dataset.arrivals || '[]').length), {
      timeout: 10000,
    })
    .toBeGreaterThanOrEqual(stops.length + 1);
  const arrivals = await carousel.evaluate(
    (el) =>
      JSON.parse(el.dataset.arrivals || '[]') as {
        position: number;
        start: number;
        end: number;
      }[],
  );
  const expected = [...stops.slice(1), 0, stops[1]];
  expected.forEach((position, index) => {
    expect(Math.abs(arrivals[index].position - position)).toBeLessThan(1);
    if (index) expect(arrivals[index].start - arrivals[index - 1].end).toBeGreaterThanOrEqual(275);
  });
});

test('demo remains a working carousel on large and ultrawide screens', async ({ page }) => {
  for (const width of [1920, 2560]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const mode of ['posters', 'interactive']) {
      await page.goto(`/?paused=true&demo=${mode}`);
      await page.evaluate(() => document.fonts.ready);
      const carousel = page.locator('.demo-carousel');
      const { stops, maximum } = await geometry(carousel);
      expect(maximum, `${mode} at ${width}px needs meaningful room to move`).toBeGreaterThan(250);
      expect(stops.length).toBeGreaterThan(2);
      await page.getByRole('button', { name: 'Next slide', exact: true }).click();
      await expectPosition(carousel, stops[1]);
      await carousel.focus();
      await page.keyboard.press('End');
      await expectPosition(carousel, maximum);
      await page.getByRole('button', { name: 'Next slide', exact: true }).click();
      await expectPosition(carousel, 0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test('playground layout options update navigation, code and shareable settings without resetting state', async ({
  page,
}) => {
  await page.goto('/?paused=true&demo=interactive');
  await page.getByRole('button', { name: 'Add one' }).click();
  await page.getByLabel('Leave yourself a note').fill('Keep this while changing layout');
  await page.getByText('Layout & behavior', { exact: true }).click();
  await page.locator('#slide-width').fill('280');
  await page.locator('#slide-gap').fill('24');
  await page.getByLabel('Direction', { exact: true }).selectOption('rtl');
  await page.getByLabel('Transition', { exact: true }).selectOption('instant');
  await page.getByLabel('Pause on hover', { exact: true }).uncheck();
  await page.getByLabel('Loop at the end').uncheck();
  const code = page.locator('#example pre');
  await expect(code).toContainText('gap: 24');
  await expect(code).toContainText('min(280px');
  await expect(code).toContainText('dir="rtl"');
  await expect(code).toContainText('behavior="instant"');
  await expect(code).toContainText('pauseOnHover={false}');
  const params = new URL(page.url()).searchParams;
  expect(params.get('width')).toBe('280');
  expect(params.get('gap')).toBe('24');
  expect(params.get('direction')).toBe('rtl');
  expect(params.get('behavior')).toBe('instant');
  expect(params.get('hover')).toBe('false');
  await expect(page.locator('.counter-value')).toHaveText('1');
  await expect(page.getByLabel('Leave yourself a note')).toHaveValue('Keep this while changing layout');

  const carousel = page.locator('.demo-carousel');
  await carousel.focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('button', { name: 'Previous slide', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expectPosition(carousel, (await geometry(carousel)).stops[1]);
  await carousel.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('button', { name: 'Next slide', exact: true })).toBeDisabled();
});

test('autoplay waits while a real touch is held, then resumes after cancellation', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(browserName !== 'chromium', 'Native CDP touch dispatch is Chromium-specific.');
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/tests/fixture.html?auto=true&interval=600&hover=false');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const box = await carousel.boundingBox();
  if (!box) throw new Error('Missing carousel');
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: box.x + 24, y: box.y + 12 }],
  });
  expect(await carousel.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  await page.waitForTimeout(900);
  expect((await geometry(carousel)).position).toBe(0);
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect.poll(async () => (await geometry(carousel)).position).toBeGreaterThan(100);
  await context.close();
});
