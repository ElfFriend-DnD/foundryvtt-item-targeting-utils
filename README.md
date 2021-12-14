# Item Targeting Utilities D&D5e

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-item-targeting-utils-5e%2Fmain%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-item-targeting-utils-5e%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fitem-targeting-utils-5e&colorB=4aa94a)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fitem-targeting-utils-5e%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/item-targeting-utils-5e/)
[![Foundry Hub Comments](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fitem-targeting-utils-5e%2Fshield%2Fcomments)](https://www.foundryvtt-hub.com/package/item-targeting-utils-5e/)

[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coke-%23FF5E5B)](https://ko-fi.com/elffriend)
[![patreon](https://img.shields.io/badge/-patreon-%23FF424D)](https://www.patreon.com/ElfFriend_DnD)

This module aims to automatically target tokens affected by items based on their "Target" properties and measured template placement.

It does so to enable modules like "Auto Check NPC Save D&D5e" to more accurately aid the GM in resolving combat actions.

## Compatiblity Notes

Compatible with:

- Minimal Rolling Enhancements
- 5e Helpers

Not Compatible with:
- DF QOL's measured template functionality doesn't affect how this module calculates token targets. It is recommended to use that module's template targeting if you want its style templates.

If you're using Midi, everything this module does is already entirely possible in Midi. Do not use this with that.

### LibWrapper Priority

This module works best when it has been Deprioritized in Libwrapper. If you are seeing chatcards for modules like Auto Roll Save appearing out of order, this is probably why.

<details>
<summary>Example showing libwrapper priority</summary>

![Image Showing deprioritization of module in Libwrapper settings.](https://user-images.githubusercontent.com/7644614/145922615-bf04c93a-b8c5-4a02-80be-d40377914383.png)
</details>

## Feature Overview

### Measured Templates

Items which have an area target will wait for the measured template to be placed before outputting a chat card (and thus firing the `Item5e.roll` hook from More Hooks 5e).

Measured Templates will target all tokens within their area. Walls which block movement will conceal tokens from targeting as long as the wall is between the point of origin for the template and the token.

## TODO:

### Ally and Enemy

Items that target "Ally" or "Enemy" with a range attached will automatically target all tokens of the appropriate disposition within that range. Walls that block movement will prevent automatic tageting.

### Self

Items that target "Self" will automatically target the token rolling the item. This is not to be confused with items that have a range of "Self"

### Range Check

Inform the GM if the targeted token or measured template is outside the range of the item being rolled.
