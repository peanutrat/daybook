# Original 32×32 elf paper doll

Source: user-supplied `精靈圖(2).zip`, 2026-10-21. Original PNGs are retained in
`public/trip/elf32/`; `src/elf32-layers.json` records their nontransparent pixels
without cropping or rescaling. The original source is never sent for image generation.

Every layer stays at its original 32×32 coordinates. The renderer composites back
hair, body, clothing, head, ears, cheek color, eyes, mouth, front hair and accessories.
No connected-component cleanup, per-part resizing, or source-character mixing is used.
Car, license and editor all use the same view box. Artwork uses whole-pixel rectangles
with crisp edges. Only original source alpha is retained (including the tiny mouth).

The original hairstyle and four uploaded eye designs remain available. Additional
code-native hair silhouettes and eye patterns in `elf32-art.ts` share the source
head outline and eye line. Hair, skin, eye, mouth, cheek, clothing and accessory
palettes are independent; outlines and fixed white trim stay intact. Recoloring uses
relative luminance rather than RGB division, so orange hair (zero blue channel) can
be changed to blue, pink or gray without clipped highlight colors.

The two uploaded smile/cat-mouth layers are visually identical; both remain source
faithful. The three supplied ear shapes are the visible ear choices. Legacy style
IDs and old source IDs can still be read from backups; old source IDs no longer
select or cut flattened sprites. Saving the new customizer marks `artVersion: elf32`.

Validation: `node checks/elf-art.mjs` compares the original layers pixel for pixel,
checks 540 hair/eye/ear combinations for shared registration and grid bounds,
checks distinct new options and independent recoloring, and round-trips settings.
`node checks/elf-art.mjs --preview` renders an actual SVG contact sheet to
`/tmp/elf32-preview.png` for visual inspection. This does not replace browser QA.
