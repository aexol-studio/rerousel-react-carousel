import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';

export interface RerouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'itemRef'> {
  children?: ReactNode;
  /** Milliseconds between advances. Non-positive/non-finite values disable autoplay. */
  interval?: number;
  /** Pause autoplay. Manual navigation remains available. */
  stop?: boolean;
  /** Return to the opposite end at the boundary. Slides are never cloned. */
  loop?: boolean;
  /** Native scrolling for next/previous, including the return at either end. */
  behavior?: 'smooth' | 'instant';
  /** Pause autoplay while the pointer is over the carousel. */
  pauseOnHover?: boolean;
  /** Optional fixed advance distance in CSS pixels; otherwise measure actual slides. */
  itemWidth?: number;
  /** @deprecated No longer needed. Slides are measured automatically. */
  itemRef?: RefObject<HTMLElement | null>;
}

export interface RerouselHandle {
  next(): void;
  previous(): void;
  /** The native scrolling element, for custom controls and integrations. */
  readonly element: HTMLDivElement | null;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)');
const css =
  '.rerousel{scroll-snap-type:x mandatory}.rerousel:focus-within{scroll-snap-type:none}.rerousel>*{flex-shrink:0;box-sizing:border-box;scroll-snap-align:start}.rerousel::-webkit-scrollbar{display:none}';

/** An unstyled, native-scroll carousel. One live copy of each child; no cloning. */
export const Rerousel = forwardRef<RerouselHandle, RerouselProps>(function Rerousel(
  {
    children,
    interval = 3000,
    stop = false,
    loop = true,
    behavior = 'smooth',
    pauseOnHover = true,
    itemWidth,
    itemRef: _itemRef,
    className = '',
    style,
    onKeyDown,
    nonce,
    ...props
  },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const destination = useRef<number | undefined>(undefined);

  const move = useCallback(
    (direction: number, edge = false) => {
      const el = viewport.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;
      const computed = getComputedStyle(el);
      const sign = computed.direction === 'rtl' ? -1 : 1;
      const slides = Array.from(el.children) as HTMLElement[];
      const first = slides[0];
      if (!first) return;
      const edgeOf = (slide: HTMLElement) => slide.offsetLeft + (sign < 0 ? slide.offsetWidth : 0);
      const fixed = itemWidth && Number.isFinite(itemWidth) && itemWidth > 0;
      const padding = computed.scrollPaddingInlineStart;
      const inset = (parseFloat(padding) || 0) * (padding.endsWith('%') ? el.clientWidth / 100 : 1);
      const origin = (sign > 0 ? edgeOf(first) : el.clientWidth - edgeOf(first)) - inset;
      const clamp = (value: number) => Math.max(0, Math.min(max, value));
      const start = fixed ? 0 : clamp(origin);
      // Keep the requested destination while native smooth scrolling is in flight.
      // Measuring the intermediate position would drop quick repeated commands.
      const position = clamp(destination.current ?? sign * el.scrollLeft);
      const boundary = direction > 0 ? position >= max - 1 : position <= start + 1;
      let target: number;
      if (edge || boundary) {
        if (boundary && !loop && !edge) return;
        target = direction > 0 ? start : max;
      } else if (fixed) {
        target = clamp(position + direction * itemWidth!);
      } else {
        const offsets = slides.map((slide) => clamp(origin + sign * (edgeOf(slide) - edgeOf(first))));
        target =
          direction > 0
            ? (offsets.find((offset) => offset > position + 1) ?? max)
            : (offsets.reverse().find((offset) => offset < position - 1) ?? start);
      }
      const instant = edge || reducedMotion().matches || behavior === 'instant';
      destination.current = instant || Math.abs(target - sign * el.scrollLeft) < 1 ? undefined : target;
      el.scrollTo({
        left: sign * target,
        behavior: instant ? 'instant' : 'smooth',
      });
    },
    [itemWidth, loop, behavior],
  );

  useImperativeHandle(
    ref,
    () => ({
      next: () => move(1),
      previous: () => move(-1),
      get element() {
        return viewport.current;
      },
    }),
    [move],
  );

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const motion = reducedMotion();
    let timer: ReturnType<typeof setInterval> | undefined;
    let hovered = pauseOnHover && el.matches(':hover');
    let pressed = false;
    let scrolling = false;
    let active = true;
    const sync = () => {
      clearInterval(timer);
      timer = undefined;
      if (
        active &&
        !stop &&
        Number.isFinite(interval) &&
        interval > 0 &&
        interval <= 2147483647 &&
        !motion.matches &&
        !document.hidden &&
        !hovered &&
        !pressed &&
        !scrolling &&
        !el.contains(document.activeElement) &&
        el.scrollWidth > el.clientWidth + 1
      ) {
        timer = setInterval(() => {
          if (destination.current === undefined) move(1);
        }, interval);
      }
    };
    const settled = () => {
      scrolling = false;
      destination.current = undefined;
      sync();
    };
    const scroll = () => {
      scrolling = true;
      clearInterval(timer);
    };
    const press = () => {
      pressed = true;
      settled();
    };
    const release = () => {
      if (!pressed) return;
      pressed = false;
      sync();
    };
    const enter = () => {
      hovered = pauseOnHover;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    // focusout fires before document.activeElement changes; cleanup guards the microtask.
    const blur = () => queueMicrotask(sync);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', settled);
    el.addEventListener('focusout', blur);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', settled);
    motion.addEventListener('change', sync);
    // Native gestures and focus scrolling take over from programmatic navigation.
    el.addEventListener('scrollend', settled);
    el.addEventListener('scroll', scroll, { passive: true });
    el.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    el.addEventListener('wheel', settled, { passive: true });
    const observer = new ResizeObserver(settled);
    const observe = () => {
      observer.disconnect();
      observer.observe(el, { box: 'border-box' });
      for (const child of el.children) observer.observe(child, { box: 'border-box' });
      settled();
    };
    const mutations = new MutationObserver((records) => {
      if (records.some(({ target }) => target === el || target.parentNode === el)) observe();
    });
    mutations.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'dir'],
    });
    observe();
    return () => {
      active = false;
      destination.current = undefined;
      clearInterval(timer);
      observer.disconnect();
      mutations.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', settled);
      el.removeEventListener('focusout', blur);
      el.removeEventListener('scrollend', settled);
      el.removeEventListener('scroll', scroll);
      el.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      el.removeEventListener('wheel', settled);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', settled);
      motion.removeEventListener('change', sync);
    };
  }, [interval, stop, pauseOnHover, move]);

  return (
    <>
      <style nonce={nonce}>{css}</style>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel"
        tabIndex={0}
        {...props}
        nonce={nonce}
        className={`rerousel ${className}`.trim()}
        ref={viewport}
        style={{
          display: 'flex',
          minWidth: 0,
          position: 'relative',
          alignItems: 'center',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          ...(itemWidth && Number.isFinite(itemWidth) && itemWidth > 0 ? { scrollSnapType: 'none' } : {}),
          ...style,
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.target !== event.currentTarget ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
          const direction =
            event.key === 'ArrowRight'
              ? rtl
                ? -1
                : 1
              : event.key === 'ArrowLeft'
                ? rtl
                  ? 1
                  : -1
                : event.key === 'Home'
                  ? 1
                  : event.key === 'End'
                    ? -1
                    : 0;
          if (direction) {
            event.preventDefault();
            move(direction, event.key === 'Home' || event.key === 'End');
          }
        }}
      >
        {children}
      </div>
    </>
  );
});
