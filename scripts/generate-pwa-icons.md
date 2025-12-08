# Generate PWA Icons

To create the required PWA icons (192x192 and 512x512), you can:

## Option 1: Use Online Tool
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your `public/icon.svg` file
3. Generate icons and download
4. Place `icon-192.png` and `icon-512.png` in the `public/` directory

## Option 2: Use ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run:
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

## Option 3: Use Node.js Script
```bash
npm install sharp
node scripts/generate-icons.js
```

## Option 4: Manual Creation
1. Open `public/icon.svg` in a design tool (Figma, Illustrator, etc.)
2. Export as PNG at 192x192 and 512x512
3. Save as `public/icon-192.png` and `public/icon-512.png`

## Temporary Solution
For now, you can copy the SVG to PNG manually or use a placeholder.
The PWA will work without icons, but icons improve the user experience.

