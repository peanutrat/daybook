# Elf paper doll: quarter view

The head and hairstyle are drawn together in a left-facing three-quarter view. Each head is registered by its cheek and chin, keeping the face, hairline and rear hair in the same perspective. Eye styles use a narrower far eye. Portraits have closer framing than the full upper-body view.

Original art was made with the built-in imagegen tool. No MapleStory game images or simulator assets are bundled. The simulator at https://maples.im/ was a visual and interaction reference.

## Art files

- `public/trip/elf-heads-quarter-v2.png`: transparent 1086×1448 head atlas. Neutral grayscale hair and red skin are separate runtime color channels; the red is a mask color, not the displayed skin color.
- `public/trip/elf-paper-doll-preview.png`: rendered examples using the actual avatar component, with varied hair and skin palettes.
- `src/elf-hair.ts`: crop rectangles, cheek/chin registration and tile cleanup clipping.
- `src/ElfAvatar.tsx`: independent hair/skin shading filters, layered rear/front hair, editable facial features, ears, upper-body outfits and accessories.

## Final generation prompt

Original customizable 2D pixel-art elf paper-doll head sprite sheet. Cute chibi heads looking toward the viewer's left in a 45-degree three-quarter view: narrower far temple, fuller near cheek and right rear skull, asymmetrical hair wrapping the turned head. Blank faces without eyes or mouths so features can be edited independently. Refined clustered pixels, delicate tapered strands, grouped shading and restrained highlights. Neutral grayscale hair; saturated red skin shades for runtime recoloring. Transparent background. Three columns, four rows: feathered crop / bob / swept short hair; long layers / high ponytail / soft curls; long waves / right-side braid / double buns; bald head in the final row's left cell. Other final-row cells empty. No text, borders, clothing or copied game assets.

## Validation

`checks/elf-art.mjs` checks shared skin/hair registration, narrower far eyes, distinct hairstyle and expression selections, independent color ramps, RGBA atlas dimensions/crop bounds, portrait framing and appearance backup round trips. Existing water-trip UI checks cover selection, staged edits, saving/canceling, goals and cup interactions in both languages. Rendered contact sheets were inspected for face fit, skin/hair separation and neighboring-tile artifacts. Browser and physical-device layout checks are separate from these checks.
