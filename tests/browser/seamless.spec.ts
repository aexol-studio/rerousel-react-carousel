import { expect, test, type Locator } from '@playwright/test';

// Assert what a user sees, rather than the implementation's scroll offset: an
// infinite track may silently normalize scrollLeft while preserving every pixel.
async function visibleStart(carousel: Locator) {
  return carousel.evaluate((el) => {
    const viewport = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const rtl = style.direction === 'rtl';
    const padding = style.scrollPaddingInlineStart;
    const inset = (parseFloat(padding) || 0) * (padding.endsWith('%') ? el.clientWidth / 100 : 1);
    return Array.from(el.querySelectorAll<HTMLElement>('[data-slide]')).map((slide) => {
      const rect = slide.getBoundingClientRect();
      return {
        index: Number(slide.dataset.slide),
        start: (rtl ? viewport.right - rect.right : rect.left - viewport.left) - inset,
      };
    });
  });
}

async function expectLeading(carousel: Locator, index: number, timeout = 5000) {
  await expect
    .poll(
      async () => Math.abs((await visibleStart(carousel)).find((slide) => slide.index === index)!.start),
      {
        timeout,
      },
    )
    .toBeLessThan(1.5);
}

async function observeStep(carousel: Locator, direction: number, expected: number, autoplay = false) {
  const result = await carousel.evaluate(
    async (el, { direction, expected, autoplay }) => {
      const style = getComputedStyle(el);
      const rtl = style.direction === 'rtl';
      const gap = parseFloat(style.columnGap) || 0;
      const padding = style.scrollPaddingInlineStart;
      const inset = (parseFloat(padding) || 0) * (padding.endsWith('%') ? el.clientWidth / 100 : 1);
      const snapshot = () => {
        const viewport = el.getBoundingClientRect();
        return {
          width: el.clientWidth - inset,
          slides: Array.from(el.querySelectorAll<HTMLElement>('[data-slide]')).map((slide) => {
            const rect = slide.getBoundingClientRect();
            const start = (rtl ? viewport.right - rect.right : rect.left - viewport.left) - inset;
            return {
              index: Number(slide.dataset.slide),
              start,
              width: rect.width,
              visible: Math.min(el.clientWidth - inset, start + rect.width) - Math.max(0, start),
            };
          }),
        };
      };
      let prior = snapshot();
      let priorTime = performance.now();
      const startTime = priorTime;
      let stable = 0;
      let movingFrames = 0;
      const failures: string[] = [];
      const control =
        document.querySelector<HTMLButtonElement>(
          `button[aria-label="${direction > 0 ? 'Next' : 'Previous'} slide"]`,
        ) ??
        Array.from(document.querySelectorAll<HTMLButtonElement>('.controls button')).find(
          (button) => button.textContent === (direction > 0 ? 'Next' : 'Previous'),
        )!;
      if (!autoplay) control.click();
      return new Promise<{ failures: string[]; movingFrames: number; reachedTarget: boolean }>((resolve) => {
        const frame = () => {
          const time = performance.now();
          const current = snapshot();
          const visible = current.slides
            .filter((slide) => slide.visible > 1)
            .sort((a, b) => a.start - b.start);
          let moved = false;
          for (const slide of visible) {
            const previous = prior.slides.find((candidate) => candidate.index === slide.index)!;
            const delta = slide.start - previous.start;
            if (previous.visible > 2 && slide.visible > 2) {
              if (delta * direction > 1.5)
                failures.push(`Slide ${slide.index} moved backwards by ${delta.toFixed(1)}px`);
              // A delayed sample may legitimately span several compositor
              // frames. Only diagnose a teleport when samples are adjacent.
              if (time - priorTime < 25 && Math.abs(delta) > slide.width / 2) {
                failures.push(
                  `Visible slide ${slide.index} teleported ${delta.toFixed(1)}px in ${(time - priorTime).toFixed(1)}ms`,
                );
              }
              moved ||= Math.abs(delta) > 0.5;
            }
          }
          if (!visible.length || visible[0].start > gap + 1.5)
            failures.push('Blank space at the leading edge');
          const last = visible[visible.length - 1];
          if (!visible.length || last.start + last.width < current.width - gap - 1.5) {
            failures.push('Blank space at the trailing edge');
          }
          for (let i = 1; i < visible.length; i++) {
            if (visible[i].start - visible[i - 1].start - visible[i - 1].width > gap + 1.5) {
              failures.push('A missing slide left a hole in the track');
            }
          }
          if (moved) movingFrames++;
          const aligned = Math.abs(current.slides.find((slide) => slide.index === expected)!.start) < 1.5;
          stable = aligned && !moved ? stable + 1 : 0;
          if ((stable >= 5 && time - startTime > 120) || time - startTime > 1800) {
            resolve({ failures: [...new Set(failures)], movingFrames, reachedTarget: aligned });
            return;
          }
          prior = current;
          priorTime = time;
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    },
    { direction, expected, autoplay },
  );
  expect(result.failures, `Transition to slide ${expected}`).toEqual([]);
  expect(result.reachedTarget, `Slide ${expected} must finish aligned at the leading edge`).toBe(true);
  expect(result.movingFrames, 'Smooth navigation must produce visible intermediate frames').toBeGreaterThan(
    1,
  );
}

for (const rtl of [false, true]) {
  test(`infinite ${rtl ? 'RTL' : 'LTR'} loop keeps moving in one direction with no gaps or visible resets`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixture.html?count=6&rtl=${rtl}`);
    const carousel = page.getByRole('region', { name: 'Fixture carousel' });
    // Wait through the initial StrictMode effects before any focus operation
    // can scroll the first input into view and mask a broken initial position.
    await carousel.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await expectLeading(carousel, 0);
    await page.getByRole('button', { name: 'Count 0: 0', exact: true }).click();
    const note = page.getByLabel('Note 0');
    await note.fill('This is the original live input');
    const original = await note.elementHandle();
    await page.getByRole('button', { name: 'Outside', exact: true }).focus();

    for (const expected of [1, 2, 3, 4, 5, 0]) await observeStep(carousel, 1, expected);
    for (const expected of [5, 4, 3, 2, 1, 0]) await observeStep(carousel, -1, expected);

    await expect(page.locator('[data-slide]')).toHaveCount(6);
    await expect(page.locator('#note-0')).toHaveCount(1);
    expect(await original!.evaluate((el) => el.isConnected && el === document.getElementById('note-0'))).toBe(
      true,
    );
    await expect(note).toHaveValue('This is the original live input');
    await expect(page.getByRole('button', { name: 'Count 0: 1', exact: true })).toBeVisible();
    await note.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(note).toBeFocused();
    await expectLeading(carousel, 0);
    await carousel.focus();
    await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight');
    await expectLeading(carousel, 1);
    await page.keyboard.press('End');
    await expectLeading(carousel, 5);
    await page.keyboard.press('Home');
    await expectLeading(carousel, 0);
  });

  test(`infinite ${rtl ? 'RTL' : 'LTR'} motion preserves scroll padding through the seam`, async ({
    page,
  }) => {
    await page.goto(`/tests/fixture.html?count=6&rtl=${rtl}`);
    const carousel = page.getByRole('region', { name: 'Fixture carousel' });
    await carousel.evaluate((el) => {
      el.style.paddingInline = '20px';
      el.style.scrollPaddingInlineStart = '20px';
    });
    await carousel.focus();
    await page.keyboard.press('Home');
    await page.getByRole('button', { name: 'Outside', exact: true }).focus();
    await expectLeading(carousel, 0);
    for (const expected of [1, 2, 3, 4, 5, 0]) await observeStep(carousel, 1, expected);
    await observeStep(carousel, -1, 5);
  });
}

test('autoplay carries the final slide into the first without reversing or leaving a hole', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?count=6&auto=true&interval=350&hover=false');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  for (const expected of [1, 2, 3, 4, 5, 0]) await observeStep(carousel, 1, expected, true);
});

test('instant infinite navigation keeps the requested slide after native snapping and resize', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?count=6&behavior=instant&cssSmooth=true');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await carousel.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await expectLeading(carousel, 0);
  for (const expected of [1, 2, 3, 4, 5, 0]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectLeading(carousel, expected);
    await page.locator('.fixture-width').evaluate((el, expected) => {
      el.style.width = expected % 2 ? '300px' : '640px';
    }, expected);
    await page.waitForTimeout(100);
    await expectLeading(carousel, expected);
  }
});

test('rapid commands across the loop boundary and later resizing preserve live content', async ({ page }) => {
  await page.goto('/tests/fixture.html?count=6');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await page.getByLabel('Note 0').fill('Kept through rapid navigation and resize');
  await page.getByRole('button', { name: 'Outside', exact: true }).focus();
  await page.locator('.controls').evaluate((controls) => {
    const [previous, next] = Array.from(controls.querySelectorAll('button'));
    for (let i = 0; i < 10; i++) next.click();
    for (let i = 0; i < 2; i++) previous.click();
  });
  // Firefox's native smooth animation takes longer; all eight requested
  // advances must finish before the resize is allowed to interrupt them.
  await expectLeading(carousel, 2, 10000);
  await page.waitForTimeout(700);
  await expectLeading(carousel, 2, 10000);
  await page.locator('.fixture-width').evaluate((el) => {
    el.style.width = 'min(300px, 100%)';
  });
  await expectLeading(carousel, 2);
  for (const expected of [3, 4, 5, 0]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectLeading(carousel, expected);
  }
  await expect(page.getByLabel('Note 0')).toHaveValue('Kept through rapid navigation and resize');
  await expect(page.locator('#note-0')).toHaveCount(1);
});

test('the full-width demo keeps complete slides and smooth loop seams on wide screens', async ({ page }) => {
  for (const [width, mode, count] of [
    [2560, 'posters', 6],
    [1920, 'interactive', 5],
  ] as const) {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto(`/?paused=true&demo=${mode}`);
    await page.evaluate(() => document.fonts.ready);
    const carousel = page.locator('.demo-carousel');
    await carousel.evaluate((el) => {
      Array.from(el.children).forEach((slide, index) => {
        (slide as HTMLElement).dataset.slide = String(index);
      });
    });
    for (let step = 1; step <= count; step++) await observeStep(carousel, 1, step % count);
    const fill = await carousel.evaluate((el) => {
      const viewport = el.getBoundingClientRect();
      const slides = Array.from(el.children).map((slide) => slide.getBoundingClientRect());
      const visible = slides.filter(
        (rect) => rect.right > viewport.left + 1 && rect.left < viewport.right - 1,
      );
      return {
        count: visible.length,
        clipped: Math.max(
          0,
          ...visible.map((rect) => Math.max(viewport.left - rect.left, rect.right - viewport.right)),
        ),
      };
    });
    expect(fill.count).toBe(3);
    expect(
      fill.clipped,
      'Only native subpixel snap rounding may clip an otherwise complete slide',
    ).toBeLessThan(1.5);
  }
});

test('changing slide count or fitting the content disables and restores looping without losing state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/tests/fixture.html?count=6');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await page.getByRole('button', { name: 'Count 0: 0', exact: true }).click();
  await page.getByLabel('Note 0').fill('Preserved when loop becomes finite');
  await page.getByRole('button', { name: 'Outside', exact: true }).focus();
  await observeStep(carousel, 1, 1);
  await observeStep(carousel, 1, 2);
  await page.locator('.fixture-width').evaluate((el) => {
    el.style.width = '1500px';
  });
  await carousel.focus();
  await page.keyboard.press('Home');
  await expectLeading(carousel, 0);
  await page.keyboard.press('End');
  const atEnd = await carousel.evaluate((el) => el.scrollLeft);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForTimeout(200);
  expect(await carousel.evaluate((el) => el.scrollLeft)).toBe(atEnd);
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Remove slide' }).click();
  await expect(page.locator('[data-slide]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove slide' }).click();
  await page.locator('.fixture-width').evaluate((el) => {
    el.style.width = '640px';
  });
  await expect(page.locator('[data-slide]')).toHaveCount(4);
  await carousel.focus();
  await page.keyboard.press('Home');
  await page.getByRole('button', { name: 'Outside', exact: true }).focus();
  for (const expected of [1, 2, 3, 0]) await observeStep(carousel, 1, expected);
  await expect(page.getByLabel('Note 0')).toHaveValue('Preserved when loop becomes finite');
  await expect(page.getByRole('button', { name: 'Count 0: 1', exact: true })).toBeVisible();
});

test('slide margins count toward the offscreen space needed for a seamless loop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/tests/fixture.html?width=900');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  await carousel.evaluate((el) => {
    Array.from(el.children).forEach((child) => {
      const slide = child as HTMLElement;
      slide.style.width = '240px';
      slide.style.marginInline = '20px';
    });
  });
  await carousel.focus();
  await page.keyboard.press('Home');
  const maximum = await carousel.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(maximum).toBe(268);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect.poll(() => carousel.evaluate((el) => el.scrollLeft)).toBe(maximum);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForTimeout(300);
  expect(await carousel.evaluate((el) => el.scrollLeft)).toBe(maximum);
});

test('native touch can cross the last-to-first seam and swipe back without hitting an edge', async ({
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
  try {
    const page = await context.newPage();
    await page.goto('/tests/fixture.html?count=6');
    const carousel = page.getByRole('region', { name: 'Fixture carousel' });
    for (const expected of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expectLeading(carousel, expected);
    }
    const box = await carousel.boundingBox();
    if (!box) throw new Error('Missing carousel');
    const session = await context.newCDPSession(page);
    for (const direction of [1, -1]) {
      const start = box.x + (direction > 0 ? box.width - 24 : 24);
      const y = box.y + 12;
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: start, y }],
      });
      for (let step = 1; step <= 16; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: start - direction * step * 16, y }],
        });
        await page.waitForTimeout(30);
      }
      // Remove flick momentum so this checks one adjacent slide at the seam.
      await page.waitForTimeout(120);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expectLeading(carousel, direction > 0 ? 0 : 5);
    }
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
    await expect(page.locator('[data-slide]')).toHaveCount(6);
  } finally {
    await context.close();
  }
});
