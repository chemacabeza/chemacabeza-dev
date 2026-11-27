// Run with: node scripts/generate-android-icons.mjs
// Use the sharp dependency installed with Next.js to preserve the SVG branding.
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const svg = await readFile(new URL("../app/icon.svg", import.meta.url));
const output = new URL("../public/icons/", import.meta.url);
await mkdir(output, { recursive: true });

// The source SVG has a 32px viewBox. Render at the destination density so the
// artwork stays sharp instead of enlarging an intermediate 32px raster.
const render = (size) =>
    sharp(svg, { density: (72 * size) / 32 }).resize(size, size);

await Promise.all(
    [192, 512].map((size) =>
        render(size)
            .png()
            .toFile(fileURLToPath(new URL(`icon-${size}.png`, output))),
    ),
);

// Keep the gear inside the central safe circle (radius: 40% of the canvas).
// A 384px rendering on an opaque 512px canvas also leaves generous padding for
// Android launchers that crop icons to circles, squircles, or other masks.
const maskableArtwork = await render(384).png().toBuffer();
await sharp({
    create: {
        width: 512,
        height: 512,
        channels: 3,
        background: "#020817",
    },
})
    .composite([{ input: maskableArtwork, left: 64, top: 64 }])
    .removeAlpha()
    .png()
    .toFile(fileURLToPath(new URL("icon-maskable-512.png", output)));
