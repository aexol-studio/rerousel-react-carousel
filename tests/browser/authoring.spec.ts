import { expect, test, type Locator } from '@playwright/test';

async function leading(carousel: Locator, selector: string) {
  return carousel.evaluate((el, selector) => {
    const left = el.getBoundingClientRect().left;
    return Array.from(el.querySelectorAll<HTMLElement>(selector))
      .map((slide) => ({
        index: Number(slide.dataset.slide ?? slide.dataset.nestedSlide),
        offset: slide.getBoundingClientRect().left - left,
      }))
      .sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset))[0];
  }, selector);
}

async function expectLeading(carousel: Locator, index: number, selector = ':scope > [data-slide]') {
  await expect
    .poll(async () => {
      const first = await leading(carousel, selector);
      return first.index === index && Math.abs(first.offset) < 1.5;
    })
    .toBe(true);
}

test('looping preserves author inline styles and removes its markers when disabled or unmounted', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?count=6&cleanup');
  const carousel = page.getByRole('region', { name: 'Fixture carousel' });
  const styles = await carousel.evaluate((el) => {
    (el as HTMLElement).style.scrollSnapType = 'x mandatory';
    for (const slide of Array.from(el.children) as HTMLElement[]) slide.style.order = '8';
    (window as any).savedCarousel = el;
    return [el, ...el.children].map((node) => node.getAttribute('style'));
  });
  await carousel.focus();
  await page.keyboard.press('Home');
  for (const index of [1, 2, 3, 4, 5, 0]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectLeading(carousel, index);
    expect(
      await carousel.evaluate((el) => [el, ...el.children].map((node) => node.getAttribute('style'))),
    ).toEqual(styles);
  }
  await page.getByRole('button', { name: 'Loop: true', exact: true }).click();
  await expect(carousel.locator('[data-rerousel-head]')).toHaveCount(0);
  await expect(carousel).not.toHaveAttribute('data-rerousel-moving');
  expect(
    await carousel.evaluate((el) => [el, ...el.children].map((node) => node.getAttribute('style'))),
  ).toEqual(styles);
  await page.getByRole('button', { name: 'Loop: false', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expectLeading(carousel, 1);
  await page.getByRole('button', { name: 'Unmount carousel' }).click();
  await expect(carousel).toHaveCount(0);
  expect(
    await page.evaluate(() => {
      const el = (window as any).savedCarousel as HTMLElement;
      return {
        markers: el.querySelectorAll('[data-rerousel-head]').length,
        moving: el.hasAttribute('data-rerousel-moving'),
        styles: [el, ...el.children].map((node) => node.getAttribute('style')),
      };
    }),
  ).toEqual({ markers: 0, moving: false, styles });
});

test('nested carousels loop independently without losing their input or affecting the outer slide', async ({
  page,
}) => {
  await page.goto('/tests/fixture.html?count=6&nested');
  const outer = page.getByRole('region', { name: 'Fixture carousel' });
  const inner = page.getByRole('region', { name: 'Nested carousel' });
  const input = page.getByLabel('Nested note');
  await input.fill('One live nested input');
  await input.evaluate((el) => {
    (window as any).savedNestedInput = el;
  });
  await page.getByRole('button', { name: 'Outside', exact: true }).focus();
  for (const index of [1, 2, 3, 0, 1, 2, 3, 0]) {
    await page.getByRole('button', { name: 'Next nested slide', exact: true }).click();
    await expectLeading(inner, index, ':scope > [data-nested-slide]');
    await expectLeading(outer, 0);
  }
  for (const index of [1, 2, 3, 4, 5, 0]) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expectLeading(outer, index);
    await expectLeading(inner, 0, ':scope > [data-nested-slide]');
  }
  await expect(input).toHaveValue('One live nested input');
  expect(await input.evaluate((el) => el === (window as any).savedNestedInput)).toBe(true);
  await expect(inner.locator(':scope > [data-nested-slide]')).toHaveCount(4);
  await expect(outer.locator(':scope > [data-slide]')).toHaveCount(6);
});
