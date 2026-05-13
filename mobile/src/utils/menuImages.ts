// Local-bundled menu images. Originally we hot-linked Unsplash URLs; mirroring
// them removes the only network dependency in the demo flow, so the Loom can
// be recorded offline and reviewers never see a placeholder.
//
// Each entry is a `require()` call so Metro can resolve and bundle the asset
// at build time. Falls back to MENU_IMAGE_PLACEHOLDER blurhash for the (very
// brief) decode moment before the first frame draws.

import type { ImageSource } from "expo-image";

// Warm-amber low-frequency blurhash, matches the dark bistro palette.
export const MENU_IMAGE_PLACEHOLDER = "L7Hf*$00~q?b~q4nM{IUj[xuRjof";

const IMAGES: Record<string, ImageSource> = {
  "spicy-chicken-sandwich": require("../../assets/menu/spicy-chicken-sandwich.jpg"),
  "smash-burger": require("../../assets/menu/smash-burger.jpg"),
  "miso-salmon-bowl": require("../../assets/menu/miso-salmon-bowl.jpg"),
  "margherita-flatbread": require("../../assets/menu/margherita-flatbread.jpg"),
  "kale-caesar": require("../../assets/menu/kale-caesar.jpg"),
  "truffle-fries": require("../../assets/menu/truffle-fries.jpg"),
  "mac-and-cheese": require("../../assets/menu/mac-and-cheese.jpg"),
  "brussels": require("../../assets/menu/brussels.jpg"),
  "side-salad": require("../../assets/menu/side-salad.jpg"),
  "still-water": require("../../assets/menu/still-water.jpg"),
  "sparkling-water": require("../../assets/menu/sparkling-water.jpg"),
  "iced-latte": require("../../assets/menu/iced-latte.jpg"),
  "lemonade": require("../../assets/menu/lemonade.jpg"),
  "chocolate-mousse": require("../../assets/menu/chocolate-mousse.jpg"),
  "olive-oil-cake": require("../../assets/menu/olive-oil-cake.jpg"),
};

/**
 * Returns the local bundled image for a menu item ID, falling back to the
 * remote URL (passed in) if the ID isn't in the local map. The fallback lets
 * us add new menu items without re-bundling assets immediately.
 */
export function menuImageSource(
  itemId: string,
  fallbackUrl?: string
): ImageSource {
  return IMAGES[itemId] ?? { uri: fallbackUrl ?? "" };
}
