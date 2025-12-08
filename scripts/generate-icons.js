// Script to generate PWA icons from SVG
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSvgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Check if SVG exists
    if (!fs.existsSync(iconSvgPath)) {
      console.error('❌ icon.svg not found at:', iconSvgPath);
      console.log('💡 Please ensure public/icon.svg exists');
      return;
    }

    console.log('🔄 Generating PWA icons...');

    // Generate 192x192 icon
    await sharp(iconSvgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192.png'));
    console.log('✅ Generated icon-192.png');

    // Generate 512x512 icon
    await sharp(iconSvgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));
    console.log('✅ Generated icon-512.png');

    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    console.log('\n💡 Alternative: Use an online tool like https://realfavicongenerator.net/');
  }
}

generateIcons();

