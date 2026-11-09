import { afterEach, beforeEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
export let motion: MediaQueryList;
export let scrollTo: ReturnType<typeof vi.fn>;
export let resize: () => void;
let root: Root | undefined;
export let host: HTMLDivElement;

export function render(node: ReactNode) {
  act(() => {
    if (!root) {
      host = document.createElement('div');
      document.body.append(host);
      root = createRoot(host);
    }
    root.render(node);
  });
  return host.querySelector('.rerousel') as HTMLDivElement;
}
export function unmount() {
  act(() => root?.unmount());
  root = undefined;
}
export function tick(ms = 3000) {
  act(() => vi.advanceTimersByTime(ms));
}
export function dimensions(el: HTMLElement, widths = [200, 200, 200], viewportWidth = 200) {
  Object.defineProperties(el, {
    clientWidth: { configurable: true, value: viewportWidth },
    scrollWidth: { configurable: true, value: widths.reduce((a, b) => a + b, 0) },
  });
  let offset = 0;
  Array.from(el.children).forEach((child, index) => {
    Object.defineProperty(child, 'offsetLeft', { configurable: true, value: offset });
    Object.defineProperty(child, 'offsetWidth', { configurable: true, value: widths[index] ?? 0 });
    offset += widths[index] ?? 0;
  });
  act(() => resize());
}
export function fire(el: EventTarget, type: string) {
  act(() => {
    el.dispatchEvent(new Event(type));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  motion = new EventTarget() as MediaQueryList;
  Object.assign(motion, { matches: false });
  vi.stubGlobal('matchMedia', () => motion);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
    this.scrollLeft = options.left ?? 0;
    this.dispatchEvent(new Event('scrollend'));
  });
  vi.stubGlobal('scrollTo', scrollTo);
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo });
});
afterEach(() => {
  unmount();
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
