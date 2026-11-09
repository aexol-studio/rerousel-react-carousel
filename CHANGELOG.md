# Changelog

## 1.0.0 — Unreleased

Breaking modernization of Rerousel for React 18.3.1 and React 19.

- Replace the old duplicated-child/timer implementation with native scrolling over one live copy of each slide. Slide state, refs, IDs, focus and form values stay intact.
- Loop with a smooth return between the ends, with an optional instant transition. Each slide renders once; this is not a continuous marquee.
- Remove typestyle and all runtime dependencies. Ship minified ESM and CommonJS, public TypeScript declarations and a preserved client directive.
- Fix implicit `children` typing, stale scroll positions, mobile reverse scrolling at the loop boundary, interval cleanup, frequent parent renders and StrictMode behavior.
- Measure actual slide offsets for unequal/responsive widths, padding, borders and gaps. `itemRef` is optional and deprecated; `itemWidth` now works as an optional fixed advance distance.
- Add native keyboard navigation, RTL support, app-owned navigation refs, finite mode, hover/focus pause, document visibility pause and reduced-motion handling.
- Replace Snowpack, ttypescript, Jest 26 and the old CSS/runtime tooling with current development tooling. Audit the complete lockfile, including dev dependencies.
- Replace the old sandbox with a responsive live playground, interactive examples, copyable code, API reference and measured footprint.
- Add compatibility, browser, accessibility, package/SSR and size checks; replace publish-on-push workflows with an explicit tested release workflow.

### Preview corrections

- Fix unequal-width RTL navigation getting stuck, dropped rapid navigation commands, and native snapping canceling explicit `itemWidth` steps.
- Wait for native scroll completion before the next autoplay interval; pause while a pointer is held, even with hover pause disabled.
- Add `behavior="smooth" | "instant"` and an intrinsic minimum width that works inside flex/grid layouts.
- Expand the live demo with enough content at wide viewports, layout/direction/transition controls, visible positions and accurate pause/end/fit status.
- Add exact-destination browser regressions, repeated loops, touch holds and wide-screen coverage; refresh the vector identity and README with complete examples and troubleshooting.
