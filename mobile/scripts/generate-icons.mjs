#!/usr/bin/env node
// Generates app icons from an inline SVG. Runs via `node scripts/generate-icons.mjs`.
// Produces:
//   assets/icon.png             — iOS launcher (1024x1024, dark-gradient + flame)
//   assets/adaptive-icon.png    — Android foreground (1024x1024 transparent + flame)
//   assets/favicon.png          — Web (192x192, dark-gradient + flame)
//
// Requires `sharp` (devDependency). Re-run whenever the brand mark changes.

import sharp from "sharp";
import { copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "..", "assets");
// If a prebuild ios/ exists, the native asset catalog has its own copy of the
// icon and we have to sync it manually — `expo run:ios` doesn't refresh it.
const iosAppIconPath = resolve(
  __dirname,
  "..",
  "ios",
  "IntelligentBistro",
  "Images.xcassets",
  "AppIcon.appiconset",
  "App-Icon-1024x1024@1x.png"
);

// ─── SVG sources ────────────────────────────────────────────────────────────
// Filled-bg flame icon for iOS / web.
const FILLED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241E18"/>
      <stop offset="1" stop-color="#0E0B08"/>
    </linearGradient>
    <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F2A878"/>
      <stop offset="0.55" stop-color="#E07A3B"/>
      <stop offset="1" stop-color="#7A2E12"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="40%">
      <stop offset="0" stop-color="#E07A3B" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#E07A3B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="540" r="380" fill="url(#glow)"/>
  <g transform="translate(512, 512) scale(28) translate(-12, -16)">
    <path d="M12 1.5 C 8.5 6, 5 9.5, 5 16 C 5 24, 8.5 30, 12 30 C 15.5 30, 19 26, 19 19 C 19 15, 16 13, 14.5 9 C 13.5 6.5, 13.5 4, 12 1.5 Z" fill="url(#flame)"/>
    <path d="M12 9 C 10.5 12, 9 14, 9 18 C 9 23, 10.5 27, 12 27 C 13.5 27, 15 24, 15 20 C 15 17, 13 15.5, 12 13 C 11.5 11.5, 11.5 10.5, 12 9 Z" fill="#F2A878" opacity="0.7"/>
  </g>
</svg>
`;

// Transparent-bg flame for Android adaptive icon foreground. Android composites
// this on the `adaptiveIcon.backgroundColor` from app.json (#0E0B08).
const TRANSPARENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F2A878"/>
      <stop offset="0.55" stop-color="#E07A3B"/>
      <stop offset="1" stop-color="#7A2E12"/>
    </linearGradient>
  </defs>
  <g transform="translate(512, 512) scale(22) translate(-12, -16)">
    <path d="M12 1.5 C 8.5 6, 5 9.5, 5 16 C 5 24, 8.5 30, 12 30 C 15.5 30, 19 26, 19 19 C 19 15, 16 13, 14.5 9 C 13.5 6.5, 13.5 4, 12 1.5 Z" fill="url(#flame)"/>
    <path d="M12 9 C 10.5 12, 9 14, 9 18 C 9 23, 10.5 27, 12 27 C 13.5 27, 15 24, 15 20 C 15 17, 13 15.5, 12 13 C 11.5 11.5, 11.5 10.5, 12 9 Z" fill="#F2A878" opacity="0.7"/>
  </g>
</svg>
`;

async function generate() {
  const filled = Buffer.from(FILLED_SVG);
  const transparent = Buffer.from(TRANSPARENT_SVG);

  const iconPath = resolve(assetsDir, "icon.png");
  await sharp(filled).resize(1024, 1024).png().toFile(iconPath);
  await sharp(transparent).resize(1024, 1024).png().toFile(resolve(assetsDir, "adaptive-icon.png"));
  await sharp(filled).resize(192, 192).png().toFile(resolve(assetsDir, "favicon.png"));

  console.log("✓ Wrote assets/icon.png (1024×1024)");
  console.log("✓ Wrote assets/adaptive-icon.png (1024×1024, transparent)");
  console.log("✓ Wrote assets/favicon.png (192×192)");

  // Keep the prebuild asset catalog in sync if it exists.
  if (existsSync(iosAppIconPath)) {
    copyFileSync(iconPath, iosAppIconPath);
    console.log("✓ Synced ios/.../AppIcon.appiconset/App-Icon-1024x1024@1x.png");
    console.log(
      "  Run `xcrun simctl uninstall booted com.bistro.intelligent` then rebuild to clear cached icon."
    );
  }
}

generate().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
