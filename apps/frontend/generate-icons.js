const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const publicDir = path.join(__dirname, 'public');
  
  // Read SVG content
  const svg192 = fs.readFileSync(path.join(publicDir, 'icon-192.svg'), 'utf8');
  const svg512 = fs.readFileSync(path.join(publicDir, 'icon-512.svg'), 'utf8');
  
  // Generate 192x192 PNG
  await sharp(Buffer.from(svg192))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  
  console.log('Generated icon-192.png');
  
  // Generate 512x512 PNG
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  
  console.log('Generated icon-512.png');
  
  // Update manifest to use PNG
  const manifestPath = path.join(publicDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  manifest.icons = [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ];
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Updated manifest.json to use PNG icons');
  
  console.log('✅ Icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});