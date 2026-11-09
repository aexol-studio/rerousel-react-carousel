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
    const original = new Map<HTMLElement, string>();
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
    const geometry = () => {
      const computed = getComputedStyle(el);
      const sign = computed.direction === 'rtl' ? -1 : 1;
      const padding = computed.scrollPaddingInlineStart;
      const inset = (parseFloat(padding) || 0) * (padding.endsWith('%') ? el.clientWidth / 100 : 1);
      const offset = (slide: HTMLElement) =>
        (sign > 0 ? slide.offsetLeft : el.clientWidth - slide.offsetLeft - slide.offsetWidth) - inset;
      const max = el.scrollWidth - el.clientWidth;
      const position = sign * el.scrollLeft;
      const fixed = options.current.itemWidth;
      const step = fixed && Number.isFinite(fixed) && fixed > 0 ? fixed : 0;
      const gap = parseFloat(computed.columnGap) || 0;
      const stride = (slide: HTMLElement) => {
        const css = getComputedStyle(slide);
        return (
          slide.offsetWidth +
          gap +
          (parseFloat(css.marginInlineStart) || 0) +
          (parseFloat(css.marginInlineEnd) || 0)
        );
      };
      // A single live slide cannot occupy both edges at once. Without a spare
      // slide, retain finite scrolling instead of cloning or visibly rewinding.
      const infinite =
        options.current.loop && max > 1 && slides.length > 1 && max + 1 >= Math.max(...slides.map(stride));
      return { sign, offset, max, position, step, infinite, inset, stride };
    };
    const arrange = (next: HTMLElement[], anchor?: HTMLElement, restore = false) => {
      const before = anchor?.getBoundingClientRect().left ?? 0;
      const snap = el.style.scrollSnapType;
      el.style.scrollSnapType = 'none';
      slides = next;
      slides.forEach((slide, i) => {
        if (!original.has(slide)) original.set(slide, slide.style.order);
        const order = restore ? original.get(slide)! : String(i);
        if (slide.style.order !== order) slide.style.order = order;
      });
      if (restore) original.clear();
      const left = anchor ? el.scrollLeft + anchor.getBoundingClientRect().left - before : el.scrollLeft;
      el.style.scrollSnapType = snap;
      if (anchor) el.scrollTo({ left, behavior: 'instant' });
    };
    const rotate = (direction: number) => {
      const { sign, position, offset, inset } = geometry();
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
      arrange(next, direction > 0 ? last : first);
      return Math.abs(sign * el.scrollLeft - position) > 1;
    };
    const normalize = () => {
      const { infinite, position, max, offset, stride: slideStride } = geometry();
      if (!infinite) {
        if (original.size)
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
      let g = geometry();
      if (g.max <= 1) return;
      if (edge) {
        queued = 0;
        const natural = Array.from(el.children) as HTMLElement[];
        if (g.infinite && direction < 0) natural.unshift(natural.pop()!);
        arrange(natural);
        g = geometry();
      } else if (g.infinite) {
        // Prepare space before a command, including Previous at the initial slide.
        normalize();
        g = geometry();
        const offsets = slides.map(g.offset);
        const target = g.step
          ? g.position + direction * g.step
          : direction > 0
            ? offsets.find((value) => value > g.position + 1)
            : offsets.reverse().find((value) => value < g.position - 1);
        if (target === undefined || target < -1 || target > g.max + 1) {
          if (!rotate(direction)) return;
          g = geometry();
        }
      }
      const clamp = (value: number) => Math.max(0, Math.min(g.max, value));
      const offsets = slides.map(g.offset).map(clamp);
      const start = g.step ? 0 : offsets[0];
      const target = edge
        ? g.infinite || direction > 0
          ? start
          : g.max
        : g.step
          ? clamp(g.position + direction * g.step)
          : direction > 0
            ? (offsets.find((value) => value > g.position + 1) ?? g.max)
            : (offsets.reverse().find((value) => value < g.position - 1) ?? start);
      const instant = edge || motion.matches || options.current.behavior === 'instant';
      destination = instant || Math.abs(target - g.position) < 1 ? undefined : target;
      el.scrollTo({ left: g.sign * target, behavior: instant ? 'instant' : 'smooth' });
    };
    command.current = move;
    const settled = () => {
      if (destination !== undefined && Math.abs(geometry().position - destination) > 1) return;
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
        for (const [slide, order] of original) slide.style.order = order;
        original.clear();
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
    const externalStyle = (value: string | null) =>
      (value || '')
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part && !/^(order|scroll-snap-type):/.test(part))
        .join(';');
    const mutations = new MutationObserver((records) => {
      if (
        records.some(
          ({ target, attributeName, oldValue }) =>
            (target === el || target.parentNode === el) &&
            (attributeName !== 'style' ||
              externalStyle(oldValue) !== externalStyle((target as HTMLElement).getAttribute('style'))),
        )
      )
        observe();
    });
    mutations.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', 'style', 'dir'],
    });
    refresh.current = observe;
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', cancel);
    el.addEventListener('focusout', blur);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize);
    motion.addEventListener('change', sync);
    el.addEventListener('scrollend', settled);
    el.addEventListener('scroll', scroll, { passive: true });
    el.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    el.addEventListener('wheel', cancel, { passive: true });
    observe();
    return () => {
      active = false;
      clearInterval(timer);
      observer.disconnect();
      mutations.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', cancel);
      el.removeEventListener('focusout', blur);
      el.removeEventListener('scrollend', settled);
      el.removeEventListener('scroll', scroll);
      el.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      el.removeEventListener('wheel', cancel);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', sync);
      const { offset, position } = geometry();
      if (original.size)
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
