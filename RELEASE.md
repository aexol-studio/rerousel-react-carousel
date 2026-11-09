# Rerousel 1.0 release handoff

## Current status

This branch prepares a breaking **1.0.0** release. The new sandbox is deployed to **https://rerousel.netlify.app/**. npm still serves **0.1.9** as latest and **0.2.10** as beta; publishing 1.0.0 requires an authenticated npm maintainer. The site keeps its release-pending notice until registry verification succeeds.

The local GitHub account `nerooc` has READ access to `aexol-studio/rerousel-react-carousel`, not upstream push/merge permission. A fork/draft PR is the handoff path. npm CLI authentication is pending; the user has requested direct npm publication and production deployment. Netlify access to the existing `rerousel` project has been verified using the user's existing CLI account; the site is not currently linked to a repository build.

## Scope and tradeoff

React 18.3.1 and current React 19; current evergreen browsers; zero runtime dependencies; native scrolling; optional autoplay and looping; app-owned controls; live interactive slides. Each slide has one live React copy. The loop seamlessly recycles fully offscreen slides using one marker and CSS grouping, and compensates the native scroll position; `behavior="instant"` is available. Overflow must cover at least the widest outer slide (including inline margins) plus the gap, otherwise scrolling is finite. Recommend two spare slides beyond the maximum visible count for native gestures in both directions. The component owns slide CSS `order` and reserves `data-rerousel-*` attributes; DOM reading/tab order stays original. Native `scrollLeft` can recenter, so custom indicators should use visible slide geometry. React 16/17 support and deep imports are removed. `itemRef` is optional/deprecated.

## Local verification

The smaller marker-based revision was checked against the shipping build, including actual frame-by-frame slide geometry rather than relying on native scroll offsets.

- `npm run check`: library and production demo builds, enforced gzip budget, formatting, strict TypeScript and 31 unit tests. Build runs first so a clean CI checkout generates the size metadata imported by the demo before type checking.
- `npm run test:compat`: all 31 unit tests pass with React 18.3.1 and 19.3.1 in isolated installs; public declarations compile against both type generations.
- `npm run test:package`: exact npm tarball file allowlist, no runtime dependencies, ESM/CJS client directives and imports, consumer types and real Node server rendering without browser globals.
- Browser regression run: **143 passed, 13 intentional skips** from 156 cases across Chromium, Firefox, desktop WebKit and iPhone WebKit. Coverage includes frame-by-frame forward/backward loop seams, no reversed motion or blank spaces, autoplay, instant movement and subsequent resize, rapid commands, native touch across both seams, retained DOM/input/React state, unequal widths, RTL, padding, margins, fractional sizes, dynamic children, finite fallback, stale resize notifications, keyboard/focus/reduced motion, nested carousels, unchanged author inline styles, cleanup and demo controls. Twelve skips are native CDP touch cases on non-Chromium engines; one fitting-layout check is desktop-only.
- Additional visual QA of the deployed preview measured **144 settled positions** in Chromium, Firefox and WebKit across 390, 768, 1440, 1920 and 2560px, in both demo modes. Complete equal-width slides fill both edges through the loop seam. Opened and reviewed desktop, tablet and phone screenshots; zero page overflow, browser errors or axe violations in this pass.
- Earlier independent pathological-layout checks covered **144 smooth transitions** across three engines with scroll padding, margins, strongly unequal widths, LTR and RTL; state/DOM identity, content changes and finite/infinite resizing were also checked.
- `npm audit`: zero known vulnerabilities, including development dependencies. The original lockfile reported 55 findings: 1 low, 31 moderate, 17 high, 6 critical. Audit status is a point-in-time result.
- Reviewed the current official Web Interface Guidelines: semantic controls, labels, focus states, reduced motion, visible pause controls, overflow and status feedback. Design exceptions remain recorded in DESIGN.md.

`lib/size.json` measures the shipping minified ESM entry with Node zlib gzip level 9: **2,644 bytes gzip**, **5,601 bytes ESM**, **2,364 bytes Brotli**, with a **2,675-byte** enforced ceiling and **zero runtime dependencies**. Compared with the previous seamless-loop build (2,872 gzip / 6,603 ESM), this saves **228 gzip bytes (7.9%)** and **1,002 ESM bytes (15.2%)**, retaining the full API and looping safeguards. One marker replaces per-slide inline ordering, and geometry is reused within each operation. React, demo assets and the npm archive are separate measurements. The demo reads the generated size JSON. The local npm archive contains only the library entry points, declarations, size metadata, package manifest, README, changelog and license.

A direct DOM-mutation benchmark across Chromium, Firefox and WebKit used 6, 24 and 120 slides. In steady navigation, the previous build rewrote 6, 24 and 120 child styles respectively; the new build changed exactly **two child marker attributes** and no child styles. Both performed two root updates. Visible sequence, DOM identity and input values stayed intact. This measures DOM writes, not total layout cost or a guaranteed speedup; geometry scans and browser layout still depend on the content.

The production demo includes the built Rerousel artifact; React's own client runtime accounts for most of the demo's JavaScript. The Vite build may warn that `use client` is not preserved in a static demo bundle. Both actual npm entry points retain the directive, and the package smoke test enforces it. No browser console/runtime errors were observed during the passing browser tests.

## Direct release while GitHub Actions is unavailable

The GitHub billing lock prevents hosted runners from starting. It does not prevent authenticated local npm publishing or direct Netlify deployment, and no CI requirement has been removed or falsely marked as passed.

1. Run the local validation commands listed above. The library at `b87b859` passed the full browser suite; the subsequent production-link change passes the build, formatting, type and unit checks.
2. Complete `npm login --auth-type=web` with a maintainer authorized to publish `rerousel` (the registry currently lists `aexol-studio`). Complete 2FA through npm.
3. Publish the prepared archive with `npm publish artifacts/rerousel-1.0.0.tgz --access public --tag latest`. The release-ready archive has a dated changelog and release README, while the branch README remains marked pending until publication. Its ESM/CJS imports, types and server rendering pass the clean-consumer smoke test. Do not request CI provenance for a local publication.
4. Verify the published version, latest tag and tarball integrity. Copy the finalized release README/changelog from the archive back to the branch and record the release.
5. Build the demo without `VITE_RELEASE_PREVIEW` and deploy to the existing Netlify site. Until upstream merges the PR, set `VITE_SOURCE_URL` to the verified fork commit's GitHub tree URL so migration, source and measurement links resolve to v1. The normal default remains upstream `master`.

A GitHub owner may merge once repository rules permit; this local account has read-only upstream access. Do not use `[skip ci]` to fake a successful required check. Preserve the workflow for future releases after the billing lock is resolved.

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

## Production and review preview

A draft deploy is available at https://6af1b0d905ff6b7f8a909e2c--rerousel.netlify.app/ (Netlify deploy ID `6af1b0d905ff6b7f8a909e2c`). It is a deploy-preview with no production publication timestamp and a noindex header. Production was updated on 2026-11-09 to deploy `6af1c43c4f7a6a8e4253cbee` at https://rerousel.netlify.app/; the previous deploy `6084a12febd42f25d9817528` remains available for rollback. The preview includes a release-pending banner so its install instructions do not imply that npm already serves 1.0.0.

## Upstream CI access dependency

The initial PR check did not start a runner. GitHub's check annotation reports: “The job was not started because your account is locked due to a billing issue.” An upstream owner must resolve the billing lock before hosted CI and the trusted npm workflow can run. This is separate from the passing local checks. CI pins Ubuntu 24.04 to avoid the current ubuntu-latest image migration.
