import {
  forwardRef,
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
  /** Seamlessly recycle offscreen slides when there is enough spare content. No clones. */
  loop?: boolean;
  /** Native scrolling for next/previous. */
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

const css =
  '.rerousel{scroll-snap-type:x mandatory}.rerousel:focus-within{scroll-snap-type:none}.rerousel>*{flex-shrink:0;box-sizing:border-box;scroll-snap-align:start}.rerousel::-webkit-scrollbar{display:none}.rerousel:has(>[data-rerousel-head])>*{order:1!important}.rerousel>[data-rerousel-head],.rerousel>[data-rerousel-head]~*{order:0!important}.rerousel[data-rerousel-moving]{scroll-snap-type:none!important}';

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
  const command = useRef<(direction: number, edge?: boolean) => void>(() => {});
  const refresh = useRef(() => {});
  const options = useRef({ interval, stop, loop, behavior, pauseOnHover, itemWidth });
  options.current = { interval, stop, loop, behavior, pauseOnHover, itemWidth };

  useImperativeHandle(
    ref,
    () => ({
      next: () => command.current(1),
      previous: () => command.current(-1),
      get element() {
        return viewport.current;
      },
    }),
    [],
  );

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let arranged = false;
    let slides: HTMLElement[] = [];
    let declared: HTMLElement[] = [];
    let measured = '';
    const measure = () =>
      [el.clientWidth, el.scrollWidth, ...declared.map((slide) => slide.offsetWidth)].join();
    let destination: number | undefined;
    let queued = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let hovered = el.matches(':hover');
    let pressed = false;
    let scrolling = false;
    let active = true;
    // Reuse geometry within each operation, refreshing after a layout change.
    let sign = 1,
      inset = 0,
      max = 0,
      position = 0,
      step = 0,
      gap = 0,
      infinite = false;
    const offset = (slide: HTMLElement) =>
      (sign > 0 ? slide.offsetLeft : el.clientWidth - slide.offsetLeft - slide.offsetWidth) - inset;
    const slideStride = (slide: HTMLElement) => {
      const css = getComputedStyle(slide);
      return (
        slide.offsetWidth +
        gap +
        (parseFloat(css.marginInlineStart) || 0) +
        (parseFloat(css.marginInlineEnd) || 0)
      );
    };
    const geometry = () => {
      const computed = getComputedStyle(el);
      sign = computed.direction === 'rtl' ? -1 : 1;
      const padding = computed.scrollPaddingInlineStart;
      inset = (parseFloat(padding) || 0) * (padding.endsWith('%') ? el.clientWidth / 100 : 1);
      max = el.scrollWidth - el.clientWidth;
      position = sign * el.scrollLeft;
      const fixed = options.current.itemWidth;
      step = fixed && Number.isFinite(fixed) && fixed > 0 ? fixed : 0;
      gap = parseFloat(computed.columnGap) || 0;
      // One live slide cannot occupy both edges. Keep short collections finite.
      infinite =
        options.current.loop &&
        max > 1 &&
        slides.length > 1 &&
        max + 1 >= Math.max(...slides.map(slideStride));
    };
    const arrange = (next: HTMLElement[], anchor?: HTMLElement, restore = false) => {
      const before = anchor?.getBoundingClientRect().left ?? 0;
      // CSS groups siblings around one marker; never rewrite each slide's style.
      el.setAttribute('data-rerousel-moving', '');
      slides[0]?.removeAttribute('data-rerousel-head');
      slides = next;
      if (!restore) slides[0]?.setAttribute('data-rerousel-head', '');
      arranged = !restore;
      const left = anchor ? el.scrollLeft + anchor.getBoundingClientRect().left - before : el.scrollLeft;
      el.removeAttribute('data-rerousel-moving');
      if (anchor) el.scrollTo({ left, behavior: 'instant' });
    };
    const rotate = (direction: number) => {
      geometry();
      const first = slides[0];
      const last = slides[slides.length - 1];
      const candidate = direction > 0 ? first : last;
      const hidden =
        direction > 0
          ? offset(first) + inset + first.offsetWidth <= position + 1
          : offset(last) + inset >= position + el.clientWidth - 1;
      if (!hidden || candidate.contains(document.activeElement)) return false;
      const next = [...slides];
      if (direction > 0) next.push(next.shift()!);
      else next.unshift(next.pop()!);
      const before = el.scrollLeft;
      arrange(next, direction > 0 ? last : first);
      return Math.abs(el.scrollLeft - before) > 1;
    };
    const normalize = () => {
      geometry();
      if (!infinite) {
        if (arranged)
          arrange(
            declared,
            slides.find((slide) => offset(slide) + slide.offsetWidth > position),
            true,
          );
        return;
      }
      // Keep a buffer for native gestures without walking the entire track.
      // Only a hidden slide moves; visible pixels are preserved in this frame.
      const direction = position > max / 2 ? 1 : -1;
      const stride =
        direction > 0 ? offset(slides[1]) - offset(slides[0]) : slideStride(slides[slides.length - 1]);
      if (Math.abs(position - direction * stride - max / 2) < Math.abs(position - max / 2) - 1)
        rotate(direction);
    };
    const sync = () => {
      clearInterval(timer);
      const { interval, stop, pauseOnHover } = options.current;
      if (
        active &&
        !stop &&
        Number.isFinite(interval) &&
        interval > 0 &&
        interval <= 2147483647 &&
        !motion.matches &&
        !document.hidden &&
        !(hovered && pauseOnHover) &&
        !pressed &&
        !scrolling &&
        !el.contains(document.activeElement) &&
        el.scrollWidth > el.clientWidth + 1
      ) {
        timer = setInterval(() => {
          if (destination === undefined) move(1);
        }, interval);
      }
    };
    const move = (direction: number, edge = false) => {
      if (!slides.length) return;
      if (destination !== undefined && !edge) {
        queued += direction;
        return;
      }
      measured = measure();
      geometry();
      if (max <= 1) return;
      if (edge) {
        queued = 0;
        const natural = Array.from(el.children) as HTMLElement[];
        if (infinite && direction < 0) natural.unshift(natural.pop()!);
        arrange(natural);
        geometry();
      } else if (infinite) {
        normalize();
        geometry();
      }
      let target = 0;
      for (let attempt = 0; attempt < 2; attempt++) {
        const offsets = slides.map(offset);
        const start = step ? 0 : offsets[0];
        target = edge
          ? infinite || direction > 0
            ? start
            : max
          : step
            ? position + direction * step
            : direction > 0
              ? (offsets.find((value) => value > position + 1) ?? Infinity)
              : (offsets.reverse().find((value) => value < position - 1) ?? -Infinity);
        if (attempt || !infinite || edge || (target >= -1 && target <= max + 1)) {
          target = Math.max(0, Math.min(max, target === -Infinity ? start : target));
          break;
        }
        if (!rotate(direction)) return;
        geometry();
      }
      const instant = edge || motion.matches || options.current.behavior === 'instant';
      destination = instant || Math.abs(target - position) < 1 ? undefined : target;
      el.scrollTo({ left: sign * target, behavior: instant ? 'instant' : 'smooth' });
    };
    command.current = move;
    const settled = () => {
      if (destination !== undefined) {
        geometry();
        if (Math.abs(position - destination) > 1) return;
      }
      scrolling = false;
      destination = undefined;
      if (!pressed) normalize();
      if (queued) {
        const direction = Math.sign(queued);
        queued -= direction;
        move(direction);
      }
      sync();
    };
    const cancel = () => {
      destination = undefined;
      queued = 0;
      sync();
    };
    const scroll = () => {
      scrolling = true;
      clearInterval(timer);
    };
    const press = () => {
      pressed = true;
      cancel();
    };
    const release = () => {
      if (!pressed) return;
      pressed = false;
      sync();
    };
    const enter = () => {
      hovered = true;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    const blur = () => queueMicrotask(sync);
    const observe = () => {
      cancel();
      const current = Array.from(el.children) as HTMLElement[];
      if (
        current.length !== declared.length ||
        current.some((slide, i) => slide !== declared[i]) ||
        !options.current.loop
      ) {
        slides[0]?.removeAttribute('data-rerousel-head');
        arranged = false;
        declared = current;
        slides = current;
      }
      measured = measure();
      observer.disconnect();
      observer.observe(el, { box: 'border-box' });
      for (const child of slides) observer.observe(child, { box: 'border-box' });
      normalize();
      scrolling = false;
      sync();
    };
    const resize = () => {
      const size = measure();
      if (size === measured) return;
      measured = size;
      cancel();
      normalize();
      scrolling = false;
      sync();
    };
    const observer = new ResizeObserver(resize);
    const mutations = new MutationObserver((records) => {
      if (records.some(({ target }) => target === el || target.parentNode === el)) observe();
    });
    mutations.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'dir'],
    });
    refresh.current = observe;
    const events: [EventTarget, string, EventListener][] = [
      [el, 'pointerenter', enter],
      [el, 'pointerleave', leave],
      [el, 'focusin', cancel],
      [el, 'focusout', blur],
      [document, 'visibilitychange', sync],
      [window, 'resize', resize],
      [motion, 'change', sync],
      [el, 'scrollend', settled],
      [el, 'scroll', scroll],
      [el, 'pointerdown', press],
      [window, 'pointerup', release],
      [window, 'pointercancel', release],
      [el, 'wheel', cancel],
    ];
    for (const [target, name, listener] of events) target.addEventListener(name, listener, { passive: true });
    observe();
    return () => {
      active = false;
      clearInterval(timer);
      observer.disconnect();
      mutations.disconnect();
      for (const [target, name, listener] of events) target.removeEventListener(name, listener);
      geometry();
      if (arranged)
        arrange(
          declared,
          slides.find((slide) => offset(slide) + slide.offsetWidth > position),
          true,
        );
    };
  }, []);
  useEffect(() => refresh.current(), [interval, stop, loop, behavior, pauseOnHover, itemWidth]);

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
          overflowAnchor: 'none',
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
            command.current(direction, event.key === 'Home' || event.key === 'End');
          }
        }}
      >
        {children}
      </div>
    </>
  );
});
