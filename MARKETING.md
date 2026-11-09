# Rerousel 1.0 launch kit

Status: drafts for use **after** npm publication and the production demo are verified. No announcements have been posted. Replace the size below if the final build changes it. Avoid “smallest”, “fastest”, “fully accessible” and “all vulnerabilities fixed”; those need broader evidence than a package measurement, automated audit and browser checks.

## Positioning

Rerousel is a tiny, unstyled React carousel for developers who want native scrolling and live React content without a UI framework. Its promise: a native scroll lane that wraps, with one live copy of your content. One internal marker tells CSS where the sequence begins; the browser handles movement. No cloned slides or JavaScript animation engine. The small footprint is measured and enforced at build time. Seamless looping needs spare content beyond the visible slides; shorter collections use finite scrolling. App authors own the presentation and controls.

## npm / GitHub description

A tiny, dependency-free React carousel with native scrolling and interactive slides.

## Short launch post

Rerousel 1.0 is out: a tiny, unstyled carousel for React 18 and 19.

• A 2.64 kB gzipped core with an enforced size budget
• Zero runtime dependencies
• Native scrolling, keyboard navigation, RTL and reduced-motion support
• A single marker lets CSS arrange seamless loops
• Interactive slides keep their state, refs and input values through loops

Try the playground: https://rerousel.netlify.app/
Source: https://github.com/aexol-studio/rerousel-react-carousel

## Longer developer announcement

We rebuilt Rerousel around a small promise: render your React content, advance it with native scrolling, and keep the carousel itself tiny.

Version 1.0 removes the runtime styling dependency and modernizes the package for React 18.3 and 19. It includes TypeScript declarations, ESM and CommonJS entry points, and an explicit gzip size budget in CI.

Every slide renders once. Buttons, inputs and stateful components keep their state and refs. To loop, Rerousel moves one marker between hidden slides; CSS arranges the sequence and the browser owns the scrolling. The first slide follows the last without remounting content or running a JavaScript animation engine. Provide spare slides for seamless looping; collections without enough offscreen content use finite scrolling.

The core handles keyboard navigation, RTL, reduced-motion preferences, hover/focus pause and hidden-tab pause. You provide the CSS and navigation controls. The new playground lets you try poster slides and real counter/input components, adjust the interval and copy an example.

This is a breaking release. React 16/17 support ends, itemRef is no longer required, and the looping behavior changes. The README has a migration guide.

Playground: https://rerousel.netlify.app/
Install: npm install rerousel
Source and issues: https://github.com/aexol-studio/rerousel-react-carousel

## GitHub release introduction

Rerousel 1.0 modernizes the native-scroll carousel for current React while removing all runtime dependencies. It renders each slide once, preserving interactive state and refs. One internal marker lets CSS arrange seamless loops while the browser handles movement. Provide spare content beyond the viewport for looping; shorter collections use finite scrolling. See CHANGELOG.md and the 0.x migration guide before upgrading.

## Demo / launch asset

`public/social.png` is a 1200 × 630 launch image generated from the original vector composition in `public/social.svg`. It uses the site's carmine and white identity and makes no unverifiable size/speed claims. The demo includes Open Graph metadata, canonical URL, sitemap and robots policy.

## Suggested rollout

1. Merge the reviewed implementation and confirm CI on the release commit.
2. Publish npm 1.0.0; confirm the public registry's dist-tag, artifact exports and install behavior.
3. Deploy the demo to the existing Netlify project; verify its visible package/React version and interactive examples.
4. Create a GitHub release from the same commit with the breaking-change migration notes.
5. Use the drafts above in Aexol's existing developer/social channels. Choose the accounts and destinations before posting; none are assumed here.
6. Monitor the issue tracker for installation, rendering or mobile regressions after launch. This is a launch checklist, not an activated recurring monitor.
