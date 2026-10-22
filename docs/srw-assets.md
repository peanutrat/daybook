# Super Retro World characters

User-supplied source: `SuperRetroWorld_CharacterPack_Full.zip`.

Authors and required credits:

- Gif — https://twitter.com/gif_not_jif
- Noiracide — https://twitter.com/Noiracide
- Romi — https://twitter.com/DessRomaric

The original license is retained at `public/trip/srw-LICENCE.txt`. The app uses the art as game characters and does not distribute the uploaded archive. The artwork was read directly from the supplied PNG sprites; it was not regenerated.

## Integration

`src/srw-characters.json` stores the native RGBA pixels of one 16×20 standing frame for each of the 32 supplied characters, plus the supplied bare-head base. Eye lines are registered to the same row before splitting heads and outfits. `src/srw-characters.ts` supplies typed lookup and validation helpers.

`ElfAvatar.tsx` renders only the upper body, using exact native pixel coordinates without interpolation. Original-color presets retain the source pixels and colors. Head and outfit IDs are independently selectable, with the head and neckline sharing a common origin. Original headwear is part of the source head artwork; it cannot be independently removed. Hair/skin/clothes/iris palette roles support optional color changes, with source shading retained. Some shared source colors can affect small trim details as well as the dominant hair or clothing area.

New optional appearance fields `spriteCharacter`, `spriteHead`, and `spriteOutfit` survive the existing local-storage/full-backup flow. Old appearance data remains readable. Selecting a whole-character preset restores its native appearance; switching heads or outfits preserves the other selected component. Eye, ear, mouth and overlay accessories remain editable, and original facial artwork can be selected.

The character picker, main editing preview, license card and car driver all use the same renderer. The picker only mounts the active category's larger grid, and its 32-item lists scroll within a bounded area on mobile.

## Checks

`checks/elf-art.mjs` verifies pixel-for-pixel original-color rendering for all 32 presets, upper-body clipping, independent palette changes, head/outfit selection, expression choices and backup validation. `checks/water-trip-ui.mjs` verifies staged character selection and saving/canceling in Traditional Chinese and English, alongside the existing cup/goal/ticket interactions. A rendered overview is available at `public/trip/srw-character-preview.png`.
