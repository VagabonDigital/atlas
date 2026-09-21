# Inside Atlas — showcase study 01

Isolated visual checkpoint, retained as the approved study. Open `/prototypes/inside-atlas-showcase/` through a static server at the repository root. The current local preview runs at http://127.0.0.1:4173/prototypes/inside-atlas-showcase/.

## Reference inspection

Inspected the live https://www.paddle.com/ homepage, computed DOM styles, keyboard scrolling, and the supplied progression contact sheet on 20 September 2026.

At a 1440 × 900 desktop viewport, Paddle's cards measured approximately 1248 × 542 CSS pixels, with 16px corners, 32px flow gaps, and `overflow: hidden`. The cards use `position: sticky`, `top: auto`, bottom offsets of 108 / 90 / 54px, and descending z-indices 3 / 2 / 1. The principal shadow is `0 32px 32px rgba(0,0,0,.32)`. Their section uses a white field and 128px bottom padding. No transform was applied to the inspected cards.

Actual scrolling confirms the distinction: the front card travels upward while the later cards wait underneath at their bottom offsets. Later cards then travel upward in turn. This is a bottom-anchored stack, not top-pinned cards or scroll locking. The final card leaves naturally before the warm following section. At the initial narrower viewport the sticky bottom offset was auto, so the desktop behavior was not active.

Atlas's existing page uses DM Serif Display headings, DM Sans body text, italic Playfair Display kickers, a #f3f0e9 canvas, #211f1b headings, #504b43 body text and #4d7184 accents. These informed the prototype; the existing page was also inspected in the browser.

## Composition

- Three warm cards on a #fdfdfc stage, with a warm approach and release to make the background relationship judgeable.
- Image-led composition, a compact editorial heading band, generous horizontal scale and soft shadows. Forest is the sole cover so it remains unambiguous.
- The supplied product PNGs are copied unchanged. Cover controls, Overview navigation and Focus navigation are preserved. The wide Overview supplies more visible teaching structure than the close reference.
- Desktop uses CSS bottom-sticky layering with 32px flow gaps. Short desktop viewports reduce the card width so the product view fits. Mobile uses ordinary flow and intact screenshots; detailed screenshot text is necessarily smaller there.
- No JavaScript, scroll interception, animation library or production integration. Screenshot controls are part of the images, not interactive product controls.
- These are different supplied subjects illustrating three stages of the product journey, not a claim that one subject changes into another.

## Checked

Browser inspection of the existing Inside Atlas page; prototype entry, both card handoffs and warm release at 1440 × 900; default shorter desktop viewport; 390 × 844 mobile layout. All three images load, no horizontal overflow, and mobile cards return to non-sticky flow. Copy and mobile art direction remain provisional for this composition checkpoint.

The isolated direction was approved. The integrated version now lives in `tutors/index.html`, immediately after the original hero and before the original overview video, with styles in `tutors/showcase.css` and local assets in `tutors/assets/showcase/`.

Integration preserves the three compositions, removes the study-only introductory and closing sections, and retains the small stage label. Yasmin and Toru are rendered as proportionally scaled UI badges over the first two screenshots; their image alternatives include those content states. The source PNGs remain unchanged. The integrated mobile treatment uses a bounded bottom-sticky sequence in portrait and a side-by-side sticky sequence in landscape. The product stage retains its approved light palette independently of the surrounding page theme.

The integrated entrance, card handoffs and video release were inspected at desktop and mobile sizes. All original page content is retained. Integration remains local for contextual visual review.

## Narrow-screen bug-fix restoration

The third state remains **03 · FOCUS MODE**. The integrated Forest uses its original screenshot and centered subject-title panel again. Focus restores its original screenshot title crop and existing readable question. The crop window now scales with image width, preventing the baked-in question from appearing underneath the title at narrow widths.

Overview retains its screenshot scale and offsets. Its card follows the image's natural height, bounded by the existing viewport limit, so a tall empty band cannot develop below the screenshot. Sticky positioning and bottom offsets are unchanged. Desktop and landscape compositions are preserved.

Browser checks at 320 × 568, 360 × 740, 390 × 844 and 400 × 844 verified the restored compositions, one visible question, forward/reverse handoffs and release into the existing page. Document scrollWidth equals clientWidth at all four sizes. The reported page-level scrollbar did not reproduce, including at the page bottom; the oversized images are clipped by their existing local containers. Existing library and material-tab horizontal scrollers remain contained and unchanged. No blanket overflow rule is applied to the stage or page.