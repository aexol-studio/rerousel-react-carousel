# Rerousel design record

## Product and audience

Rerousel is an MIT-licensed, unstyled React carousel by Aexol. Developers need to see its actual behavior, understand the small API, and copy a working example. The release is a breaking 1.0 modernization for React 18.3 and 19, with modern evergreen browsers as the baseline.

Subject inventory: the repeating Rerousel name; arbitrary JSX; native scrolling; the 3,000 ms default; tiny distribution; npm installation; MIT license; Aexol authorship; the legacy itemRef API; interactive slide state; an existing monochrome wordmark; the original Netlify demo.

## Concept

On this page, Rerousel's repeating live content becomes the moving word in a large typographic composition. The product itself is the primary visual: a working, configurable carousel of original sample typographic posters and an interactive counter. No invented customer logos, testimonials, usage statistics, or product screenshots.

Copy deck: “Your content. On repeat.” → a tiny unstyled React carousel → working playground → measured package footprint → install and working code → complete API → questions and GitHub contribution links.

## Direction and tokens

Taste's “The sentence is the layout” is the starting direction. Barlow Condensed 700 for display, Barlow 400/500/600 for interface text, system monospace only for actual code. Self-host the OFL fonts, load with swap. Carmine #9c1220, dark ink #242323, white #ffffff, light surface #f5f4f2, pale rose #ffd9dc. CSS custom properties own semantic colors, five principal text sizes, 8px spacing rhythm, small 6px control radius, responsive 20–56px gutters, 1400px maximum content width.

The hero is a large typographic sentence above a dark working product stage. The live sample slides use a consistent, original poster language; their colors are examples, not additional page accents. The playground controls sit alongside the stage on desktop and below on phones. Documentation follows in a light field with a carmine statement about the package footprint. The compact header logo uses a three-slide lowercase-r mark and outlined Barlow lettering; light/dark variants share identical proportions and require no font download. Footer repeats the wordmark language.

## Interaction and states

Buttons have explicit hover, active, focus-visible, and disabled states; minimum 44px touch targets. Inputs have visible labels. Copy actions announce success/failure in a polite status region and retain a selectable code fallback. Controls change actual library props and expose their current settings in the copyable example. Navigation uses links and anchors with scroll margin. The carousel exposes app-owned previous/next and pause controls, plus native touch scrolling and keyboard arrows/Home/End. Inputs and buttons inside slides retain their own keyboard behavior. Reduced motion disables autoplay and smooth scrolling. Focus also disables scroll snapping to preserve caret editing in Safari/RTL inputs. Focus and hover pause autoplay; hidden tabs do not advance.

## Library tradeoff

Each React slide renders once. Autoplay uses native scrolling between real slide positions, then scrolls back to the start after the last position. The `behavior` setting chooses smooth (default) or instant movement, including this return. This prioritizes fully interactive content and a small reliable implementation; it is not a continuous marquee. No cloned React trees, duplicated IDs, inert copies, or remounted slide state. When all items fit, autoplay does no work. Fixed item widths are optional; actual offsets account for variable widths, borders, padding and gaps. The original itemRef is accepted but no longer required.

## Wide-screen playground revision

The original three 264px interactive slides could fit entirely inside the desktop viewport, while four posters barely overflowed. The demo incorrectly displayed “Autoplay on” in that state. Both problems made the carousel appear broken despite a rendered interface.

The bounded 1512px page presents six posters or five distinct interactive examples: counter, text input, link, checkbox, and native disclosure. The default layout evenly fills the viewport with complete slides: one below 600px of carousel width, two from 600px, and three from 960px. Each slide uses `(available width − total gaps) / visible count`, with border-box sizing. Container queries respond to the actual stage space, including when controls sit beside it. Both examples retain meaningful overflow even at a 2560px browser width, and settled first/last positions have no clipped card fragments. The stage retains its natural height when advanced settings expand.

Keep common controls immediately visible: content, advance interval, looping, and pause/resume. Put “Fit full slides,” maximum slide width, gap, direction, transition, and hover pause inside an accessible native “Layout & behavior” disclosure. Full-slide fitting is enabled by default; disabling it enables the maximum-width slider and restores the optional partial-slide preview. Settings persist in the shareable URL and generate a complete example with a bounded container and working navigation/pause buttons. Reset restores layout and playback defaults without discarding interactive content. Sizing remains demo CSS and adds no library runtime code.

Status derives from the real viewport and interaction state: all slides fit, system reduced motion, explicitly paused, hidden tab, focus inside, pointer inside, finite end reached, or autoplay on. The stage also shows the currently intersecting slide range. Finite navigation disables unavailable previous/next controls; RTL changes their arrow direction. Slide state is retained when settings change.

## Deliberate Taste exceptions

- The live product is the imagery. No stock photos or generated raster art: those would increase demo weight without explaining this developer library. The built-in imagegen tool is available but not needed.
- Code is monospace, API tables have quiet separators, labels are compact, controls use borders, and sample slides are rectangular panels: these are functional developer documentation and carousel content.
- No additional scroll choreography, video, entrance delays, or motion quota. The carousel is the sole motion focus and honors reduced motion. All other content is visible immediately.
- The hero copy remains short; the supporting sentence explicitly names React carousel functionality.

## Verification

Capture and open desktop, tablet, and phone screenshots; test browser errors, horizontal overflow, keyboard and focus, reduced motion, real slide state, native touch scrolling, controls and clipboard behavior. Apply current Web Interface Guidelines. Record the final measured footprint and actual QA results in RELEASE.md.

### Inspector exception registry

Actual tablet headline wrapping and vertical overlap were fixed after opening the first screenshots. At 1440, 768 and 390px, the page h1 now occupies two lines, with no horizontal page overflow. The following Taste measurements are waived for this developer/product demo, not for unreviewed usability problems:

- `headline-lines`: only the sample posters deliberately put three words on three lines. The page's actual heading hierarchy fits its measure.
- `eyebrow`: actual slide content, a React version diagnostic and an installation section label, rather than invented editorial decoration.
- `hairline`: functional API/FAQ/documentation separators and an actual navigation link underline.
- `font-count`: two site families plus system monospace for code; the detector counts the generic code fallback separately.
- `size-count`: the content posters, wordmark and size proof have independent graphic scales; interface text remains coherent.
- `few-pictures` / `no-footage`: a real live carousel is the product evidence; stock media would distract from it and increase weight.
- `side-scroll` / `one-sided-bleed`: the optional fixed-width mode intentionally reveals part of the next slide. The default full-slide mode fits equal cards between both viewport edges when settled. Buttons and a swipe/keyboard hint make horizontal navigation explicit in both modes.
- `still-page`: screenshots use paused autoplay for deterministic review; the actual carousel motion is browser-tested. No additional page-motion quota is appropriate.
- `off-centre` / `edge-text`: the 2026-11-09 wider inspection includes the measured text bounds of slides and code beyond their scroll-clipping viewport. The actual frame has equal margins; the document has zero horizontal overflow at 2560, 1440, 768, and 390px, and opened screenshots confirm these are intentionally clipped scrollers.
