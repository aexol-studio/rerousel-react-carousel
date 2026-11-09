<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/nerooc/rerousel-react-carousel/codex/rerousel-modernization/public/logo-dark.svg" />
  <img src="https://raw.githubusercontent.com/nerooc/rerousel-react-carousel/codex/rerousel-modernization/public/logo.svg" alt="Rerousel" width="338" height="64" />
</picture>

**A tiny, unstyled React carousel. Your content, your styles.**

Native scrolling. One live copy of each slide. Zero runtime dependencies. React 18 and 19.

[v1 preview](https://6af1b0d905ff6b7f8a909e2c--rerousel.netlify.app/) · [Current website](https://rerousel.netlify.app/) · [Quick start](#quick-start) · [API](#api) · [Migration](#migrating-from-0x) · [Issues](https://github.com/aexol-studio/rerousel-react-carousel/issues)

> **These docs describe the upcoming breaking v1 release.** Publication is pending; `npm install rerousel` currently installs the previous release. Use the repository checkout to try v1 before it is published. Existing users: read [Migrating from 0.x](#migrating-from-0x).

## What you get

- Native touch and trackpad scrolling with CSS scroll snapping.
- Previous/next controls, keyboard navigation, optional autoplay and seamless looping.
- One mounted copy of each slide: counters, forms, links, DOM refs and IDs stay intact.
- Responsive and unequal slide widths, gaps, borders, RTL and changing content.
- Automatic pause for focus, hover, hidden tabs and reduced motion.
- TypeScript, ESM and CommonJS. React stays external; no CSS import is required.

Rerousel handles movement and essential layout. You supply slide content, styles and visible controls. It does not virtualize large collections or render a themed navigation UI.

The core is approximately **2.64 kB gzipped**, with an enforced build budget. The measurement is the minified ESM entry compressed with gzip level 9, excluding React, the demo and the npm archive. Run `npm run size` for the current byte count; see [the size check](https://github.com/aexol-studio/rerousel-react-carousel/blob/master/scripts/size.mjs).

## Installation and support

After v1 is published:

```sh
npm install rerousel
```

Requires **React 18.3.1 or React 19**. The compatibility suite runs against **18.3.1 and 19.3.1**, including their TypeScript declarations. Current Chrome, Edge, Firefox and Safari are the support target, including mobile browsers.

The component uses ResizeObserver, native smooth scrolling, scrollend events, CSS scroll snap and `:has()`. It ships no browser polyfills. See [Development](#development) to run the unpublished v1 locally.

## Quick start

```tsx
import { Rerousel } from 'rerousel';

export function Gallery() {
  return (
    <section style={{ maxWidth: 720, minWidth: 0 }}>
      <Rerousel stop aria-label="Selected work" style={{ width: '100%', gap: 16 }}>
        {['Make', 'Something', 'Worth', 'Moving'].map((title) => (
          <article key={title} style={{ width: 'min(20rem, 85%)', padding: 24 }}>
            <h2>{title}</h2>
            <p>Your own content goes here.</p>
          </article>
        ))}
      </Rerousel>
      <p>Swipe, scroll, or focus the carousel and use the arrow keys.</p>
    </section>
  );
}
```

This example starts with autoplay paused. Add the controls below when enabling it. The container has a maximum width so the slides overflow even on a large display; a carousel only moves when its content is wider than its viewport.

### Sizing that works in real layouts

Give each slide a width. For an evenly filled viewport, divide the available width between the visible slides after subtracting the gaps. This example shows one, two or three complete slides according to the container width, including when the last and first slides share the viewport:

```css
.gallery-column {
  min-width: 0; /* Allow this flex/grid child to shrink below its content width. */
  max-width: 60rem;
  container: gallery-layout / inline-size;
}

.gallery {
  --visible-slides: 1;
  --gap: 1rem;
  width: 100%;
  gap: var(--gap);
}

.gallery-slide {
  box-sizing: border-box;
  width: calc((100% - (var(--visible-slides) - 1) * var(--gap)) / var(--visible-slides));
}

@container gallery-layout (min-width: 600px) {
  .gallery {
    --visible-slides: 2;
  }
}

@container gallery-layout (min-width: 960px) {
  .gallery {
    --visible-slides: 3;
  }
}
```

Wrap `<Rerousel className="gallery">` in a `gallery-column` element and give each direct slide the `gallery-slide` class. For seamless looping, include more slides than the largest visible count. Two extra slides are recommended so native gestures have offscreen room in both directions; for three visible slides, use at least five. The demo uses this layout by default. Turn off **Fit full slides** in its layout controls to try fixed widths with a partial next slide.

Pixels, percentages, `clamp()` and unequal widths also work; Rerousel measures rendered positions, so no item ref is needed. In a grid layout, use `minmax(0, 1fr)` for the column holding the carousel. Keep horizontal container padding symmetric. Do not override the essential `display: flex`, `position: relative` or child `flex-shrink: 0` layout rules. Leave slide CSS `order` to Rerousel while looping.

Each direct DOM child is one slide. A component can be a slide if it renders one wrapper element; fragments also work when each item is an element. Wrap bare text. Rerousel does not add wrappers around your children.

### Interactive content and controls

```tsx
import { useId, useRef, useState } from 'react';
import { Rerousel, type RerouselHandle } from 'rerousel';

export function InteractiveGallery() {
  const carousel = useRef<RerouselHandle>(null);
  const noteId = useId();
  const [paused, setPaused] = useState(true);
  const [count, setCount] = useState(0);
  const slideStyle = { width: 'min(20rem, 85%)', padding: 24 };

  return (
    <section aria-label="Interactive example" style={{ maxWidth: 720, minWidth: 0 }}>
      <button type="button" onClick={() => setPaused((value) => !value)}>
        {paused ? 'Start autoplay' : 'Pause autoplay'}
      </button>

      <Rerousel
        ref={carousel}
        stop={paused}
        interval={4000}
        aria-label="Interactive slides"
        style={{ width: '100%', gap: 16 }}
      >
        <article style={slideStyle}>
          <h2>A real counter</h2>
          <button type="button" onClick={() => setCount((value) => value + 1)}>
            Clicked {count} times
          </button>
        </article>
        <article style={slideStyle}>
          <h2>A real input</h2>
          <label htmlFor={noteId}>Your note</label>
          <input id={noteId} name="note" defaultValue="Still here after a loop" />
        </article>
        <article style={slideStyle}>
          <h2>A real link</h2>
          <a href="https://github.com/aexol-studio/rerousel-react-carousel">Read the source</a>
        </article>
        <article style={slideStyle}>
          <h2>A real checkbox</h2>
          <label>
            <input type="checkbox" defaultChecked /> Keep this checked
          </label>
        </article>
        <article style={slideStyle}>
          <h2>A real disclosure</h2>
          <details>
            <summary>Show more</summary>
            <p>This stays open when you navigate away and back.</p>
          </details>
        </article>
      </Rerousel>

      <button type="button" onClick={() => carousel.current?.previous()}>
        Previous
      </button>
      <button type="button" onClick={() => carousel.current?.next()}>
        Next
      </button>
    </section>
  );
}
```

State and input values survive navigation because each slide remains mounted once. Use stable React keys when adding, removing or reordering slides. As with any React list, changing a component's key can reset its state.

### Looping and motion

With `loop={true}`, the first slide follows the last in the same direction, and Previous works in reverse. A single internal marker sets the start of the cyclic slide order. CSS lays out the two groups around that marker. When a slide is fully offscreen, Rerousel moves the marker and compensates the scroll position in the same update. The browser handles scrolling and snapping, with no JavaScript animation loop. Each slide keeps its original DOM node and React instance.

Seamless looping needs spare content: `scrollWidth - clientWidth` must be at least the widest outer slide (including inline margins) plus the gap. Without that space, a single live slide cannot appear at both edges. Rerousel then uses finite scrolling and stays at the boundary. For native gestures in both directions, provide at least two extra slides beyond the largest visible count. If all slides fit, navigation and autoplay remain idle.

`behavior="smooth"` is the default for manual advances and autoplay. Use `behavior="instant"` for immediate movement. The browser controls smooth-scroll timing. Home/End select the first/last slide immediately (the first/last available position in finite mode), and reduced motion always forces immediate movement. This is a slide-by-slide carousel; autoplay waits between advances.

Set `loop={false}` for finite navigation. Advancing past the first or last available position leaves it in place.

CSS ordering changes visual positions only. Screen readers and Tab navigation keep the original DOM order. A focused slide is not recycled; focus inside the carousel pauses autoplay. Leave slide CSS `order` and `data-rerousel-*` attributes under the component's control.

## API

### Component props

| Prop           | Type                             | Default    | Meaning                                                                                                           |
| -------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `children`     | `ReactNode`                      | —          | Your slide elements.                                                                                              |
| `interval`     | `number`                         | `3000`     | Milliseconds between automatic advances. Non-positive, non-finite or values above 2,147,483,647 disable autoplay. |
| `stop`         | `boolean`                        | `false`    | Pause autoplay. Touch, keyboard and custom controls remain available.                                             |
| `loop`         | `boolean`                        | `true`     | Seamless recycling with enough offscreen content; finite scrolling otherwise.                                     |
| `behavior`     | `'smooth' \| 'instant'`          | `'smooth'` | Scrolling behavior for navigation and autoplay. Reduced motion takes priority.                                    |
| `pauseOnHover` | `boolean`                        | `true`     | Pause autoplay while the pointer is over the carousel.                                                            |
| `itemWidth`    | `number`                         | automatic  | Optional fixed advance distance in CSS pixels. Invalid values fall back to measured slide positions.              |
| `itemRef`      | `RefObject<HTMLElement \| null>` | —          | Deprecated; accepted for migration but no longer read.                                                            |
| `ref`          | `Ref<RerouselHandle>`            | —          | The navigation handle described below.                                                                            |

An explicit `itemWidth` disables CSS snapping so the requested pixel distance is respected. Automatic sizing retains slide snapping.

Standard `div` attributes pass through, including `className`, `style`, `dir="rtl"`, `aria-label` and event handlers. The `data-rerousel-*` prefix is reserved for internal layout bookkeeping. `itemRef` keeps its legacy React-ref meaning rather than HTML's microdata `itemref` attribute.

### Ref methods

| Member       | Purpose                                                                                |
| ------------ | -------------------------------------------------------------------------------------- |
| `next()`     | Advance to the next slide, continuing through the last-to-first seam when looping.     |
| `previous()` | Advance to the previous slide, continuing through the first-to-last seam when looping. |
| `element`    | Read-only reference to the native scrolling `HTMLDivElement`, or `null` before mount.  |

Methods also work while autoplay is stopped. Rapid next/previous commands are queued until the current native animation settles; opposite queued commands cancel each other. The handle is available after React mounts the component; use optional chaining in event handlers.

In loop mode, `element.scrollLeft` recenters as hidden slides are recycled. It is a physical scroll position, not a permanent slide index or progress value. For custom indicators, compare slide bounding boxes with the viewport to identify the visible content.

### Autoplay and accessibility

Provide a visible start/pause control, as in the interactive example. Give the carousel a descriptive `aria-label`; the default is “Carousel”.

| Situation                                        | Behavior                                            |
| ------------------------------------------------ | --------------------------------------------------- |
| `stop={true}`                                    | Autoplay is paused; manual navigation works.        |
| Pointer over the carousel                        | Autoplay pauses unless `pauseOnHover={false}`.      |
| Focus anywhere inside a slide or on the carousel | Autoplay pauses until focus leaves.                 |
| Browser tab hidden                               | Autoplay pauses until the document is visible.      |
| Reduced-motion preference enabled                | Autoplay is disabled; manual navigation is instant. |
| All slides fit                                   | Autoplay remains idle.                              |

When the carousel itself has focus, **Left/Right** navigate in the visual direction; **Home/End** select the first/last slide (or the first/last available position in finite mode). Keys from inputs, buttons and other descendants remain available to those elements. Native swipe and trackpad scrolling stay available. Autoplay waits during a pointer gesture or in-progress scroll, then gives the settled slide a full interval before advancing.

The root is a focusable region with `aria-roledescription="carousel"`. Your content supplies its own headings, labels, contrast and visible focus indicators. The component does not announce every automatic advance or clone interactive elements.

### Next.js, SSR and content security policy

Both ESM and CommonJS entry points preserve `"use client"` and can be imported and server-rendered without browser globals. For refs, state and event handlers in a React Server Components application, put your gallery in a client component:

```tsx
'use client';

import { Rerousel } from 'rerousel';

export function Gallery() {
  return (
    <Rerousel stop aria-label="Featured articles" style={{ maxWidth: 720, gap: 16 }}>
      {/* Your slide elements, each with an explicit width. */}
    </Rerousel>
  );
}
```

No DOM work happens during server rendering. Hydration starts with the same slide tree.

If supplied, `nonce` is forwarded to the small essential `<style>` element. The component also uses inline layout styles; a strict CSP must permit those styles or provide equivalent styling under your policy. No external stylesheet or font is loaded by the package.

## Troubleshooting

| Symptom                                                          | What to check                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing moves on a large screen                                  | Compare `element.scrollWidth` with `element.clientWidth`. If everything fits, this is expected. Constrain the gallery width, use wider slides or add more content.                              |
| The page gets wider instead of the carousel scrolling            | Add `min-width: 0` to its flex/grid parent and use `minmax(0, 1fr)` for the grid track. Give the carousel a bounded width.                                                                      |
| Autoplay appears stopped                                         | Check `stop`, `interval`, hover, focus, document visibility and reduced motion. Moving focus to a slide intentionally pauses autoplay.                                                          |
| The last slide does not align with the first edge in finite mode | The final position is clamped to the content end to avoid empty trailing space. This is expected with unequal widths or several visible slides.                                                 |
| Looping stops at a boundary                                      | Ensure `loop` is enabled and overflow is at least the widest outer slide (including inline margins) plus the gap. Add more slides or reduce the visible count. A focused slide is not recycled. |
| A custom progress indicator jumps                                | Native `scrollLeft` recenters during looping. Identify visible slides from their bounding boxes rather than treating the physical scroll offset as a fixed index.                               |
| Arrows do not move the carousel while typing                     | Input and other descendant keys are intentionally preserved. Focus the carousel container itself or use your navigation buttons.                                                                |
| Custom layout breaks measurement                                 | Keep the root relatively positioned and slides as direct flex children. Leave CSS `order` to Rerousel; avoid transforms that reposition slides without changing layout.                         |
| State resets when the slide list changes                         | Check React keys and component types. Rerousel never clones slides, but React remounts a child when its key or type changes.                                                                    |

For a bug report, include the React/browser version, viewport width, relevant CSS and a minimal reproduction. [Open an issue](https://github.com/aexol-studio/rerousel-react-carousel/issues).

## Migrating from 0.x

1. Upgrade to React 18.3.1 or React 19. React 16/17 are no longer supported.
2. Remove `itemRef` unless your own code needs it. Rerousel now measures slide positions automatically.
3. Children now render once. Remove workarounds for duplicated IDs, refs or component effects.
4. Looping now recycles fully offscreen slides for seamless last-to-first movement. Provide spare slides, leave their CSS `order` to Rerousel, and do not derive a fixed slide index from `scrollLeft`. Insufficient content falls back to finite scrolling.
5. Add a descriptive label and visible autoplay control. Focus, hover, hidden documents and reduced motion now pause autoplay automatically.
6. `interval` and `stop` keep their core meanings. The previously declared `itemWidth` prop now sets a fixed advance distance; prefer automatic measurement for responsive or unequal widths.
7. Use the public `rerousel` import. ESM, CommonJS and declarations are exposed through package exports; deep imports into the old `lib` layout are unsupported.

## Development

Use **Node 24 LTS** (`nvm use`) and npm. Build/test dependencies are excluded from the published package.

```sh
npm ci
npm run build
npm start
```

The playground imports the built ESM package through `rerousel`, so it exercises the implementation that will ship. After editing the library, rebuild it. The production demo output is `dist/`; Netlify configuration lives in `netlify.toml`.

```sh
npm run check          # formatting, types, unit tests, library/demo build, size budget
npm run test:compat    # React 18.3.1 / 19.3.1 runtime and type checks
npm run test:package   # packed file allowlist, ESM/CJS, types and real Node SSR
npx playwright install chromium firefox webkit
npm run test:browser   # browser interactions, responsive layouts and accessibility
npm audit              # includes development dependencies
```

The CI workflow runs these checks on pull requests and pushes to `master`/`develop`. Publishing is a separate manual workflow, gated by the same checks. See [RELEASE.md](https://github.com/aexol-studio/rerousel-react-carousel/blob/master/RELEASE.md) for the maintainer procedure.

## Contributing and license

Keep changes focused, add a regression test for behavior fixes and preserve the package size budget. Pull requests go to the upstream repository. [Changelog](https://github.com/aexol-studio/rerousel-react-carousel/blob/master/CHANGELOG.md) · [Design record](https://github.com/aexol-studio/rerousel-react-carousel/blob/master/DESIGN.md)

MIT © [Aexol](https://aexol.com/). The Rerousel wordmark uses outlined Barlow Condensed lettering under its [SIL Open Font License](https://github.com/aexol-studio/rerousel-react-carousel/blob/master/public/licenses/BarlowCondensed-OFL.txt).
