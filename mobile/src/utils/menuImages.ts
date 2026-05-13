import { Image } from "expo-image";
import { MENU } from "../../../shared";

// Warm-amber, low-frequency placeholder shown while remote images load.
// Generated to match the dark bistro palette.
export const MENU_IMAGE_PLACEHOLDER = "L7Hf*$00~q?b~q4nM{IUj[xuRjof";

// Fire-and-forget prefetch of every menu image on app boot so subsequent
// navigation between menu / item-detail / cart shows cached images instantly.
export function prefetchMenuImages(): void {
  void Image.prefetch(
    MENU.map((m) => m.image),
    "memory-disk"
  );
}
