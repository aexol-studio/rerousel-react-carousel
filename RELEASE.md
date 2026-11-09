# Rerousel 1.0 release handoff

## Current status

This branch prepares a breaking **1.0.0** release. npm currently serves **0.1.9** as latest and **0.2.10** as beta. Do not describe 1.0 as publicly released until registry verification succeeds.

The local GitHub account `nerooc` has READ access to `aexol-studio/rerousel-react-carousel`, not upstream push/merge permission. A fork/draft PR is the handoff path. npm CLI authentication is missing. Netlify access to the existing `rerousel` project has been verified using the user's existing CLI account; the site is not currently linked to a repository build.

## Scope and tradeoff

React 18.3.1 and current React 19; current evergreen browsers; zero runtime dependencies; native scrolling; optional autoplay and looping; app-owned controls; live interactive slides. Each slide has one live React copy. The loop seamlessly recycles fully offscreen slides using CSS `order` and compensates the native scroll position; `behavior="instant"` is available. Overflow must cover at least the widest outer slide (including inline margins) plus the gap, otherwise scrolling is finite. Recommend two spare slides beyond the maximum visible count for native gestures in both directions. The component owns slide CSS `order`; DOM reading/tab order stays original. Native `scrollLeft` can recenter, so custom indicators should use visible slide geometry. React 16/17 support and deep imports are removed. `itemRef` is optional/deprecated.

## Local verification

The seamless-loop revision was checked against the shipping build, including actual frame-by-frame slide geometry rather than relying on native scroll offsets.

- `npm run check`: library and production demo builds, enforced gzip budget, formatting, strict TypeScript and 31 unit tests. Build runs first so a clean CI checkout generates the size metadata imported by the demo before type checking.
- `npm run test:compat`: all 31 unit tests pass with React 18.3.1 and 19.3.1 in isolated installs; public declarations compile against both type generations.
- `npm run test:package`: exact npm tarball file allowlist, no runtime dependencies, ESM/CJS client directives and imports, consumer types and real Node server rendering without browser globals.
- Browser regression run: **135 passed, 13 intentional skips** from 148 cases across Chromium, Firefox, desktop WebKit and iPhone WebKit. Coverage includes frame-by-frame forward/backward loop seams, no reversed motion or blank spaces, autoplay, instant movement and subsequent resize, rapid commands, native touch across both seams, retained DOM/input/React state, unequal widths, RTL, padding, margins, fractional sizes, dynamic children, finite fallback, stale resize notifications, keyboard/focus/reduced motion and demo controls. Twelve skips are native CDP touch cases on non-Chromium engines; one fitting-layout check is desktop-only.
- Additional visual QA of the deployed preview measured **144 settled positions** in Chromium, Firefox and WebKit across 390, 768, 1440, 1920 and 2560px, in both demo modes. Complete equal-width slides fill both edges through the loop seam. Opened and reviewed desktop, tablet and phone screenshots; zero page overflow, browser errors or axe violations in this pass.
- Independent pathological-layout checks covered **144 smooth transitions** across three engines with scroll padding, margins, strongly unequal widths, LTR and RTL; state/DOM identity, content changes and finite/infinite resizing were also checked.
- `npm audit`: zero known vulnerabilities, including development dependencies. The original lockfile reported 55 findings: 1 low, 31 moderate, 17 high, 6 critical. Audit status is a point-in-time result.
- Reviewed the current official Web Interface Guidelines: semantic controls, labels, focus states, reduced motion, visible pause controls, overflow and status feedback. Design exceptions remain recorded in DESIGN.md.

`lib/size.json` measures the shipping minified ESM entry with Node zlib gzip level 9: **2,872 bytes gzip**, **6,603 bytes ESM**, **2,582 bytes Brotli**, with a **2,900-byte** enforced ceiling and **zero runtime dependencies**. The additional 962 gzip bytes versus the previous rewind implementation provide single-copy recycling, scroll compensation, queued commands and resize safeguards. Recycling does not create a second React/DOM tree. React, demo assets and the npm archive are separate measurements. The demo reads the generated size JSON. The final local npm archive is 14,957 bytes and contains only the library entry points, declarations, size metadata, package manifest, README, changelog and license.

The production demo includes the built Rerousel artifact; React's own client runtime accounts for most of the demo's JavaScript. The Vite build may warn that `use client` is not preserved in a static demo bundle. Both actual npm entry points retain the directive, and the package smoke test enforces it. No browser console/runtime errors were observed during the passing browser tests.

## Maintainer release steps

1. Review and merge the PR into upstream `master`; confirm the new CI passes on that commit. Existing publish-on-push workflows have been replaced with a manual release workflow.
2. Finalize the 1.0.0 changelog date. Keep README, demo, size metadata and package version consistent. Remove the preview-only README notice/link once published and point logo URLs to the merged upstream assets.
3. Choose one npm authentication path:
   - **Recommended:** configure an npm trusted publisher for package `rerousel`: owner `aexol-studio`, repository `rerousel-react-carousel`, workflow `release.yml`, environment `npm`. Create/configure that GitHub environment if needed. The workflow grants `id-token: write`, uses Node 24 and npm 12.2.1, and publishes with provenance. This requires the package maintainer's npm/GitHub access; the workflow alone does not establish trust.
   - **Local maintainer:** run `npm login --auth-type=web` with an account authorized to publish `rerousel`, then run the validation commands and `npm publish --access public`. Complete 2FA in npm's approved flow. Do not paste tokens into chat. Provenance is available through the GitHub trusted-publishing workflow, not a claim made by a local release.
4. For the GitHub path, dispatch **Publish npm release** from `master` with version `1.0.0`. The reusable CI must pass before publish. The workflow checks the exact manifest version and release branch.
5. Verify `npm view rerousel version dist-tags dist.integrity`, install `rerousel@1.0.0` in a clean consumer, and confirm the packed ESM/CJS/types behavior. Never overwrite/unpublish existing versions to retry a failed release.
6. Build the production demo (`npm run build:sandbox`) and deploy `dist/` to the **existing** Netlify project `rerousel` (site ID `5e185104-b690-4eb3-9665-90d5a6f0fd2d`). Check the visible Rerousel and React versions, previous/next/pause, interactive counter and input, copy actions, metadata and console. For a preview while npm is pending, build with `VITE_RELEASE_PREVIEW=true`; this adds an honest release-pending banner. Build without that variable for production after npm release.
7. Create the Git tag/GitHub release for the same release commit. The npm workflow deliberately does not auto-merge or auto-create GitHub announcements.
8. Publish selected announcement drafts from MARKETING.md through the chosen accounts. No social messages have been sent and no recurring monitor has been created.

## Limits of verification

Chromium full-page CDP screenshot capture was found to alter nested native scroll offsets even with finite scrolling and snapping disabled. Visual QA therefore uses viewport/element captures, which preserve the carousel position; navigation assertions use actual geometry. No runtime workaround for this capture artifact is shipped.

Browser tests use Playwright's current Chromium, Firefox and WebKit builds, not physical iOS/Android devices or every historical browser version. Automated accessibility checks are supplemented by keyboard/focus tests and visual review; they do not replace a screen-reader audit. Next.js/RSC support is checked at the package boundary (client directives, SSR and types), not by adding and deploying a complete Next.js app to this small library repository. GitHub Actions and npm provenance need upstream maintainer execution to verify end-to-end.

## Review preview

A draft deploy is available at https://6af1ab40ec862150ebbeeab7--rerousel.netlify.app/ (Netlify deploy ID `6af1ab40ec862150ebbeeab7`). It is a deploy-preview with no production publication timestamp and a noindex header. The live production deploy remains `6084a12febd42f25d9817528`. The preview includes a release-pending banner so its install instructions do not imply that npm already serves 1.0.0.

## Upstream CI access dependency

The initial PR check did not start a runner. GitHub's check annotation reports: “The job was not started because your account is locked due to a billing issue.” An upstream owner must resolve the billing lock before hosted CI and the trusted npm workflow can run. This is separate from the passing local checks. CI pins Ubuntu 24.04 to avoid the current ubuntu-latest image migration.
