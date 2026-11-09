import { useEffect, useRef, useState, version as reactVersion, type CSSProperties } from 'react';
import { Rerousel, type RerouselHandle } from 'rerousel';
import size from '../lib/size.json';

const github = 'https://github.com/aexol-studio/rerousel-react-carousel';
const npm = 'https://www.npmjs.com/package/rerousel';
const initial = new URLSearchParams(window.location.search);
const validMode = (value: string | null) => (value === 'interactive' ? 'interactive' : 'posters');
const initialInterval = Number(initial.get('interval'));
const initialNumber = (key: string, fallback: number, min: number, max: number) => {
  const value = Number(initial.get(key));
  return initial.has(key) && value >= min && value <= max ? value : fallback;
};
const defaults = {
  mode: validMode(initial.get('demo')),
  interval: initialInterval >= 1000 && initialInterval <= 6000 ? initialInterval : 3000,
  loop: initial.get('loop') !== 'false',
  stop: initial.get('paused') === 'true',
  fit: initial.get('fit') === 'true' || (initial.get('fit') !== 'false' && !initial.has('width')),
  width: initialNumber('width', 320, 240, 440),
  gap: initialNumber('gap', 16, 0, 40),
  direction: initial.get('direction') === 'rtl' ? 'rtl' : 'ltr',
  hover: initial.get('hover') !== 'false',
  behavior: initial.get('behavior') === 'instant' ? ('instant' as const) : ('smooth' as const),
};

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={back ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CopyButton({ value, label = 'Copy code' }: { value: string; label?: string }) {
  const [status, setStatus] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('Copied');
    } catch {
      setStatus('Select and copy the code below');
    }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setStatus(''), 4000);
  };
  return (
    <span className="copy-control">
      <button className="button copy-button" onClick={copy}>
        {status === 'Copied' ? 'Copied' : label}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 9h11v12H9zM15 9V3H3v12h6" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      <span className="sr-only" role="status">
        {status}
      </span>
    </span>
  );
}

function CounterSlide() {
  const [count, setCount] = useState(0);
  return (
    <article dir="auto" className="slide interactive-slide">
      <span className="slide-kicker">Real React state</span>
      <div className="counter-value" aria-live="polite">
        {count}
      </div>
      <button className="button counter-button" onClick={() => setCount((n) => n + 1)}>
        Add one <span aria-hidden="true">+</span>
      </button>
      <p>Loop around. Your count stays.</p>
    </article>
  );
}

function InputSlide() {
  return (
    <article dir="auto" className="slide input-slide">
      <span className="slide-kicker">Real inputs, too</span>
      <div>
        <label htmlFor="slide-note">Leave yourself a note</label>
        <input id="slide-note" name="slide-note" autoComplete="off" placeholder="Type something…" />
      </div>
      <p>Your text stays when you come back.</p>
    </article>
  );
}

function ChoiceSlide() {
  const [selected, setSelected] = useState(false);
  return (
    <article dir="auto" className="slide choice-slide">
      <span className="slide-kicker">Your own controls</span>
      <div>
        <h3>Make a choice.</h3>
        <label className="slide-choice">
          <input type="checkbox" checked={selected} onChange={(event) => setSelected(event.target.checked)} />
          <span>Save this idea</span>
        </label>
      </div>
      <p>{selected ? 'Saved. It stays selected across loops.' : 'Native controls keep their state, too.'}</p>
    </article>
  );
}

function DetailsSlide() {
  return (
    <article dir="auto" className="slide details-slide">
      <span className="slide-kicker">Real disclosure</span>
      <details>
        <summary>What’s inside?</summary>
        <p>Whatever you build. This is a native details element, and it stays open as you navigate.</p>
      </details>
      <p>Open it. Go around. Come back.</p>
    </article>
  );
}

const apiRows = [
  ['children', 'ReactNode', '—', 'Your slide elements. Set their widths in your CSS.'],
  ['interval', 'number', '3000', 'Milliseconds between advances. Set ≤ 0 to disable autoplay.'],
  ['stop', 'boolean', 'false', 'Pause autoplay. Manual controls still work.'],
  [
    'loop',
    'boolean',
    'true',
    'Continue seamlessly from the final slide to the first, with enough spare slides.',
  ],
  ['behavior', "'smooth' | 'instant'", "'smooth'", 'Native scroll transition between slides.'],
  ['pauseOnHover', 'boolean', 'true', 'Pause while the pointer is over a slide.'],
  ['itemWidth', 'number', 'auto', 'Optional fixed advance distance in CSS pixels.'],
  ['itemRef', 'RefObject', '—', 'Deprecated. Accepted for migration; no longer needed.'],
  ['ref', 'RerouselHandle', '—', 'next(), previous(), and the native scrolling element.'],
];

export function App() {
  const [mode, setMode] = useState(defaults.mode);
  const [interval, setIntervalValue] = useState(defaults.interval);
  const [stop, setStop] = useState(defaults.stop);
  const [loop, setLoop] = useState(defaults.loop);
  const [slideWidth, setSlideWidth] = useState(defaults.width);
  const [fit, setFit] = useState(defaults.fit);
  const [gap, setGap] = useState(defaults.gap);
  const [direction, setDirection] = useState(defaults.direction);
  const [pauseOnHover, setPauseOnHover] = useState(defaults.hover);
  const [behavior, setBehavior] = useState(defaults.behavior);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [position, setPosition] = useState({ overflow: false, start: true, end: false, visible: '1' });
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const carousel = useRef<RerouselHandle>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const element = carousel.current?.element;
    if (!element) return;
    const measure = () => {
      const max = element.scrollWidth - element.clientWidth;
      const offset = Math.abs(element.scrollLeft);
      const bounds = element.getBoundingClientRect();
      const rtl = getComputedStyle(element).direction === 'rtl';
      const visible = Array.from(element.children)
        .map((slide, index) => ({ index: index + 1, rect: slide.getBoundingClientRect() }))
        .filter(({ rect }) => rect.right > bounds.left + 1 && rect.left < bounds.right - 1)
        .sort((a, b) => (rtl ? b.rect.right - a.rect.right : a.rect.left - b.rect.left))
        .map(({ index }) => index);
      const next = {
        overflow: max > 1,
        start: offset <= 1,
        end: offset >= max - 1,
        visible: visible.join(' · ') || '1',
      };
      setPosition((current) =>
        Object.keys(next).every((key) => current[key as keyof typeof next] === next[key as keyof typeof next])
          ? current
          : next,
      );
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    for (const slide of element.children) resize.observe(slide);
    element.addEventListener('scroll', measure, { passive: true });
    setHovered(element.matches(':hover'));
    setFocused(element.contains(document.activeElement));
    measure();
    return () => {
      resize.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [mode, slideWidth, gap, direction, fit, loop]);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.search = '';
    if (mode !== 'posters') url.searchParams.set('demo', mode);
    if (interval !== 3000) url.searchParams.set('interval', String(interval));
    if (stop) url.searchParams.set('paused', 'true');
    if (!loop) url.searchParams.set('loop', 'false');
    if (!fit) {
      url.searchParams.set('fit', 'false');
      if (slideWidth !== 320) url.searchParams.set('width', String(slideWidth));
    }
    if (gap !== 16) url.searchParams.set('gap', String(gap));
    if (direction !== 'ltr') url.searchParams.set('direction', direction);
    if (!pauseOnHover) url.searchParams.set('hover', 'false');
    if (behavior !== 'smooth') url.searchParams.set('behavior', behavior);
    window.history.replaceState(null, '', url);
  }, [mode, interval, stop, loop, slideWidth, gap, direction, pauseOnHover, behavior, fit]);

  const status = !position.overflow
    ? 'All slides fit'
    : reduced
      ? 'Reduced motion on'
      : stop
        ? 'Autoplay paused'
        : hidden
          ? 'Paused · tab hidden'
          : focused
            ? 'Paused · focus inside'
            : pauseOnHover && hovered
              ? 'Paused · pointer inside'
              : !loop && position.end
                ? 'End reached'
                : 'Autoplay on';
  const reset = () => {
    setIntervalValue(3000);
    setLoop(true);
    setStop(false);
    setSlideWidth(320);
    setFit(true);
    setGap(16);
    setDirection('ltr');
    setPauseOnHover(true);
    setBehavior('smooth');
  };
  const layoutStyles = fit
    ? `      <style>{\`
        .gallery { container: gallery / inline-size; }
        .gallery > article { width: 100%; }
        @container gallery (min-width: 600px) {
          .gallery > article { width: calc((100% - ${gap}px) / 2); }
        }
        @container gallery (min-width: 960px) {
          .gallery > article { width: calc((100% - ${gap * 2}px) / 3); }
        }
      \`}</style>\n`
    : '';
  const code = `import { useRef, useState } from 'react';
import { Rerousel, type RerouselHandle } from 'rerousel';

export function Gallery() {
  const carousel = useRef<RerouselHandle>(null);
  const [paused, setPaused] = useState(${stop});

  return (
    <section style={{ width: 'min(100%, 1040px)', minWidth: 0 }}>
${layoutStyles}      <Rerousel
        ref={carousel}
        interval={${interval}}
        stop={paused}
        loop={${loop}}
        pauseOnHover={${pauseOnHover}}
        behavior="${behavior}"
        dir="${direction}"
        className="gallery"
        aria-label="Selected work"
        style={{ gap: ${gap} }}
      >
        {['Make', 'Something', 'Move', 'Your', 'Own', 'Way'].map((title) => (
          <article key={title} dir="auto"${fit ? '' : `\n            style={{ width: 'min(${slideWidth}px, calc(100% - 32px))' }}`}>
            <h2>{title}</h2>
          </article>
        ))}
      </Rerousel>
      <button onClick={() => carousel.current?.previous()}>Previous</button>
      <button onClick={() => carousel.current?.next()}>Next</button>
      <button onClick={() => setPaused(!paused)}>
        {paused ? 'Resume autoplay' : 'Pause autoplay'}
      </button>
    </section>
  );
}`;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="hero-field">
        <header className="header frame">
          <a className="wordmark" href="#" aria-label="Rerousel home" translate="no">
            <img src="/logo-dark.svg" width="169" height="32" alt="" />
          </a>
          <nav aria-label="Main navigation">
            <a href="#playground">Playground</a>
            <a href="#start">Docs</a>
            <a href={github}>
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <a className="header-npm" href={npm}>
            View on npm <span aria-hidden="true">↗</span>
          </a>
        </header>
        <main id="main">
          {import.meta.env.VITE_RELEASE_PREVIEW === 'true' && (
            <p className="release-preview frame">
              Rerousel 1.0 preview. npm publication is pending; the install command currently resolves to the
              previous release.
            </p>
          )}
          <section className="hero frame" aria-labelledby="hero-title">
            <div className="hero-heading">
              <h1 id="hero-title">
                Your content.
                <br />
                On repeat.
              </h1>
              <div className="hero-intro">
                <p>
                  A tiny, unstyled carousel for React. Native scrolling, interactive slides, zero runtime
                  dependencies.
                </p>
                <a className="button primary" href="#start">
                  Get started <Arrow />
                </a>
                <span className="hero-note">Open source. MIT licensed.</span>
              </div>
            </div>
            <div className="package-facts" aria-label="Package facts">
              <span>{(size.gzip / 1000).toFixed(2)} kB gzipped</span>
              <span>React 18 & 19</span>
              <span>TypeScript included</span>
            </div>
          </section>
          <section id="playground" className="playground frame" aria-labelledby="playground-title">
            <div className="stage" data-ui="live-carousel">
              <div className="stage-top">
                <h2 id="playground-title">Put it in motion</h2>
                <span className="stage-status">{status}</span>
              </div>
              <Rerousel
                key={mode}
                ref={carousel}
                interval={interval}
                stop={stop}
                loop={loop}
                pauseOnHover={pauseOnHover}
                behavior={behavior}
                dir={direction}
                className="demo-carousel"
                data-fit={fit}
                style={
                  { '--slide-width': `${slideWidth}px`, '--slide-gap': `${gap}px`, gap } as CSSProperties
                }
                aria-label={mode === 'posters' ? 'Typographic poster examples' : 'Interactive React examples'}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
                onFocus={() => setFocused(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
                }}
              >
                {mode === 'posters'
                  ? [
                      <article dir="auto" className="slide poster poster-make" key="make">
                        <span className="slide-kicker">Your next idea</span>
                        <strong>
                          MAKE
                          <br />
                          SOME
                          <br />
                          MOVES.
                        </strong>
                        <span className="poster-foot">Anything you can render.</span>
                      </article>,
                      <article dir="auto" className="slide poster poster-less" key="less">
                        <span className="slide-kicker">Keep it light</span>
                        <strong>
                          LESS
                          <br />
                          IS
                          <br />
                          MORE.
                        </strong>
                        <span className="poster-foot">Zero runtime dependencies.</span>
                      </article>,
                      <article dir="auto" className="slide poster poster-loop" key="loop">
                        <span className="slide-kicker">Take another look</span>
                        <strong>
                          LOOP
                          <br />
                          IT
                          <br />
                          AGAIN.
                        </strong>
                        <span className="poster-foot">Your styles. Your content.</span>
                      </article>,
                      <article dir="auto" className="slide poster poster-yours" key="yours">
                        <span className="slide-kicker">No design attached</span>
                        <strong>
                          MAKE
                          <br />
                          IT
                          <br />
                          YOURS.
                        </strong>
                        <span className="poster-foot">A little React goes a long way.</span>
                      </article>,
                      <article dir="auto" className="slide poster poster-next" key="next">
                        <span className="slide-kicker">Go at your own pace</span>
                        <strong>
                          NEXT
                          <br />
                          GOOD
                          <br />
                          THING.
                        </strong>
                        <span className="poster-foot">Touch. Keys. Your controls.</span>
                      </article>,
                      <article dir="auto" className="slide poster poster-back" key="back">
                        <span className="slide-kicker">One more time</span>
                        <strong>
                          BACK
                          <br />
                          FOR
                          <br />
                          MORE.
                        </strong>
                        <span className="poster-foot">Keep going. The first slide comes next.</span>
                      </article>,
                    ]
                  : [
                      <CounterSlide key="counter" />,
                      <InputSlide key="input" />,
                      <article dir="auto" className="slide link-slide" key="link">
                        <span className="slide-kicker">Real links</span>
                        <strong>
                          GO
                          <br />
                          SOMEWHERE.
                        </strong>
                        <a href="#api" className="button">
                          Explore the API <Arrow />
                        </a>
                        <p>Everything inside is your component.</p>
                      </article>,
                      <ChoiceSlide key="choice" />,
                      <DetailsSlide key="details" />,
                    ]}
              </Rerousel>
              <div className="stage-bottom">
                <span className="navigation-hint">
                  <span className="slide-position">
                    {position.visible}
                    <span> / {mode === 'posters' ? 6 : 5} slides</span>
                  </span>
                  Swipe, or focus the slides and use ← →
                </span>
                <div className="carousel-buttons">
                  <button
                    className="icon-button"
                    aria-label="Previous slide"
                    disabled={!position.overflow || (!loop && position.start)}
                    onClick={() => carousel.current?.previous()}
                  >
                    <Arrow back={direction !== 'rtl'} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next slide"
                    disabled={!position.overflow || (!loop && position.end)}
                    onClick={() => carousel.current?.next()}
                  >
                    <Arrow back={direction === 'rtl'} />
                  </button>
                </div>
              </div>
            </div>
            <aside className="playground-controls" aria-label="Playground settings">
              <h3>Give it a spin</h3>
              <p>
                This is the real package. <br />
                Change a setting. See it happen.
              </p>
              <fieldset className="mode-control">
                <legend>Slide content</legend>
                <div className="segmented">
                  <label>
                    <input
                      type="radio"
                      name="content"
                      value="posters"
                      checked={mode === 'posters'}
                      onChange={() => setMode('posters')}
                    />
                    <span>Posters</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="content"
                      value="interactive"
                      checked={mode === 'interactive'}
                      onChange={() => setMode('interactive')}
                    />
                    <span>Interactive</span>
                  </label>
                </div>
              </fieldset>
              <div className="slider-setting">
                <label className="range-label" htmlFor="interval">
                  Advance every <output htmlFor="interval">{(interval / 1000).toFixed(1)} s</output>
                </label>
                <input
                  id="interval"
                  name="interval"
                  type="range"
                  min="1000"
                  max="6000"
                  step="500"
                  value={interval}
                  onChange={(event) => setIntervalValue(Number(event.target.value))}
                />
              </div>
              <details className="layout-settings">
                <summary>Layout & behavior</summary>
                <label className="check-label">
                  <span>Fit full slides</span>
                  <input
                    name="fit"
                    type="checkbox"
                    checked={fit}
                    onChange={(event) => setFit(event.target.checked)}
                  />
                </label>
                <div className="slider-setting">
                  <label className="range-label" htmlFor="slide-width">
                    Max slide width <output htmlFor="slide-width">{slideWidth} px</output>
                  </label>
                  <input
                    id="slide-width"
                    name="width"
                    type="range"
                    min="240"
                    max="440"
                    step="20"
                    disabled={fit}
                    value={slideWidth}
                    onChange={(event) => setSlideWidth(Number(event.target.value))}
                  />
                </div>
                <div className="slider-setting">
                  <label className="range-label" htmlFor="slide-gap">
                    Gap <output htmlFor="slide-gap">{gap} px</output>
                  </label>
                  <input
                    id="slide-gap"
                    name="gap"
                    type="range"
                    min="0"
                    max="40"
                    step="4"
                    value={gap}
                    onChange={(event) => setGap(Number(event.target.value))}
                  />
                </div>
                <div className="select-setting">
                  <label htmlFor="direction">Direction</label>
                  <select
                    id="direction"
                    name="direction"
                    value={direction}
                    onChange={(event) => setDirection(event.target.value)}
                  >
                    <option value="ltr">Left to right</option>
                    <option value="rtl">Right to left</option>
                  </select>
                </div>
                <div className="select-setting">
                  <label htmlFor="behavior">Transition</label>
                  <select
                    id="behavior"
                    name="behavior"
                    value={behavior}
                    onChange={(event) => setBehavior(event.target.value as 'smooth' | 'instant')}
                  >
                    <option value="smooth">Smooth scroll</option>
                    <option value="instant">Instant</option>
                  </select>
                </div>
                <label className="check-label">
                  <span>Pause on hover</span>
                  <input
                    name="hover"
                    type="checkbox"
                    checked={pauseOnHover}
                    onChange={(event) => setPauseOnHover(event.target.checked)}
                  />
                </label>
                <p>
                  {fit
                    ? 'Full slides share the available space: one, two or three per view. Switch this off to set a fixed width.'
                    : 'Fixed-width slides may reveal part of the next slide.'}{' '}
                  Focus and reduced motion always pause autoplay.
                </p>
              </details>
              <label className="check-label">
                <span>Infinite loop</span>
                <input
                  name="loop"
                  type="checkbox"
                  checked={loop}
                  onChange={(event) => setLoop(event.target.checked)}
                />
              </label>
              <button
                className="button playback"
                aria-pressed={stop}
                disabled={reduced}
                onClick={() => setStop(!stop)}
              >
                {reduced ? 'Motion reduced' : stop ? 'Resume autoplay' : 'Pause autoplay'}
                <span aria-hidden="true">{stop ? '▷' : 'Ⅱ'}</span>
              </button>
              <p className="control-note">
                {reduced
                  ? 'Your system preference disables autoplay. Previous and next still work.'
                  : !position.overflow
                    ? 'Everything fits. Increase the slide width to make room for scrolling.'
                    : 'Your settings update the code and this page’s shareable URL.'}
              </p>
              <div className="settings-actions">
                <a className="text-link" href="#example">
                  Get the code <span aria-hidden="true">↓</span>
                </a>
                <button className="reset-button" onClick={reset}>
                  Reset settings
                </button>
              </div>
            </aside>
          </section>
          <div className="hero-bottom frame">
            <span>Built with Rerousel {size.version}</span>
            <span>Running React {reactVersion}</span>
          </div>
          <section className="footprint frame" aria-labelledby="footprint-title">
            <h2 id="footprint-title">
              A small footprint.
              <br />
              One live copy.
            </h2>
            <div className="footprint-proof">
              <div className="size-number">
                {(size.gzip / 1000).toFixed(2)}
                <span>kB</span>
              </div>
              <p>
                Minified ESM, gzipped. React excluded.
                <br />
                Zero runtime dependencies. No CSS import.
              </p>
              <p>Each slide stays mounted once. Your browser does the scrolling.</p>
              <a href={`${github}/blob/master/scripts/size.mjs`}>
                See how it’s measured <span aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
          <div className="docs-field">
            <section id="start" className="getting-started frame" aria-labelledby="start-title">
              <div>
                <span className="section-label">Start building</span>
                <h2 id="start-title">
                  One import.
                  <br />
                  Your imagination.
                </h2>
                <p>Install Rerousel, add your elements, and set their widths. Everything else is your CSS.</p>
                <p className="compat-note">
                  For React 18.3+ and React 19.
                  <br />
                  Using 0.x? Read the <a href={`${github}#migrating-from-0x`}>migration guide</a>.
                </p>
              </div>
              <div className="install-panel">
                <div className="code-header">
                  <span>Terminal</span>
                  <CopyButton value="npm install rerousel" label="Copy command" />
                </div>
                <pre>
                  <code>
                    <span className="code-muted">$ </span>npm install rerousel
                  </code>
                </pre>
                <div className="install-details">
                  <span>npm · pnpm · yarn · bun</span>
                  <a href={npm}>
                    Package on npm <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </section>
            <section id="example" className="example frame" aria-labelledby="example-title">
              <div className="example-intro">
                <h2 id="example-title">Try it in your project</h2>
                <p>
                  This example follows your layout, direction, and playback settings above. A bounded
                  container keeps the slides scrollable on large screens. Replace the titles with your JSX.
                </p>
              </div>
              <div className="code-panel">
                <div className="code-header">
                  <span>Gallery.tsx</span>
                  <CopyButton value={code} />
                </div>
                <pre tabIndex={0} aria-label="Copyable React carousel example">
                  <code>{code}</code>
                </pre>
              </div>
            </section>
            <section id="api" className="api frame" aria-labelledby="api-title">
              <div className="section-heading">
                <h2 id="api-title">Small API. Full control.</h2>
                <p>
                  All standard div attributes pass through, including styles, event handlers, and accessible
                  labels.
                </p>
              </div>
              <div className="table-scroll" tabIndex={0} role="region" aria-label="Carousel API reference">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Prop</th>
                      <th scope="col">Type</th>
                      <th scope="col">Default</th>
                      <th scope="col">What it does</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiRows.map(([prop, type, value, description]) => (
                      <tr key={prop}>
                        <th scope="row">
                          <code>{prop}</code>
                        </th>
                        <td>
                          <code>{type}</code>
                        </td>
                        <td>
                          <code>{value}</code>
                        </td>
                        <td>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="questions frame" aria-labelledby="questions-title">
              <h2 id="questions-title">A few good questions</h2>
              <div className="answers">
                <details>
                  <summary>How does the loop work?</summary>
                  <p>
                    One marker tells CSS where the track starts. Moving that marker recycles offscreen slides,
                    so the last flows straight into the first. Every slide keeps its original DOM node and
                    React state; the browser handles scrolling. Leave spare slides outside the viewport; if
                    there is too little content, scrolling stops at the ends.
                  </p>
                </details>
                <details>
                  <summary>Can slides contain buttons and inputs?</summary>
                  <p>
                    Yes. Try Interactive in the playground. State, refs, IDs, and form values stay intact
                    across loops. Autoplay pauses while you interact with the carousel.
                  </p>
                </details>
                <details>
                  <summary>What about accessibility?</summary>
                  <p>
                    Add a descriptive aria-label and a visible pause control, as this demo does. Focus the
                    carousel for arrow, Home, and End navigation. Reduced-motion preferences disable autoplay
                    and smooth scrolling. Your slide content is still responsible for its own accessible
                    markup.
                  </p>
                </details>
                <details>
                  <summary>Which browsers are supported?</summary>
                  <p>
                    Current Chrome, Edge, Firefox, Safari, and their mobile equivalents. Rerousel uses native
                    scroll snapping, ResizeObserver, and standard media queries without legacy polyfills.
                  </p>
                </details>
              </div>
            </section>
          </div>
        </main>
        <footer className="footer frame">
          <div className="footer-top">
            <p>
              Put your next idea
              <br />
              on repeat.
            </p>
            <a className="button primary" href={github}>
              Explore the source <Arrow />
            </a>
          </div>
          <div className="footer-links">
            <span>
              Made by <a href="https://aexol.com/">Aexol</a>
            </span>
            <div>
              <a href={github}>GitHub</a>
              <a href={npm}>npm</a>
              <a href={`${github}/blob/master/LICENSE`}>MIT license</a>
              <a href={`${github}/issues`}>Report an issue</a>
            </div>
          </div>
          <div className="footer-wordmark" aria-hidden="true">
            rerousel<span>↻</span>
          </div>
        </footer>
      </div>
    </>
  );
}
