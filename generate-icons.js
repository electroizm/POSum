// PWA İkon Oluşturucu
import sharp from 'sharp';
import { readFileSync } from 'fs';

const primaryColor = '#2563eb'; // Tailwind primary-600
const bgColor = '#ffffff';

// SVG şablonu - POSum logosu
const svgTemplate = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Arka plan -->
  <rect width="512" height="512" rx="80" fill="url(#grad)"/>

  <!-- POS kutusu -->
  <rect x="100" y="140" width="312" height="232" rx="20" fill="${bgColor}" opacity="0.95"/>

  <!-- Ekran -->
  <rect x="130" y="170" width="252" height="100" rx="8" fill="${primaryColor}" opacity="0.3"/>

  <!-- Kart yuvası -->
  <rect x="180" y="310" width="152" height="30" rx="4" fill="${primaryColor}" opacity="0.5"/>

  <!-- "POS" yazısı -->
  <text x="256" y="240" font-family="system-ui, sans-serif" font-size="48"
        font-weight="bold" fill="${primaryColor}" text-anchor="middle">POS</text>

  <!-- "Sum" yazısı -->
  <text x="256" y="440" font-family="system-ui, sans-serif" font-size="32"
        font-weight="600" fill="${bgColor}" text-anchor="middle">Sum</text>
</svg>
`;

async function generateIcons() {
  console.log('🎨 PWA ikonları oluşturuluyor...\n');

  const svgBuffer = Buffer.from(svgTemplate);

  // 192x192 ikon
  console.log('📱 192x192 ikon oluşturuluyor...');
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('✅ public/pwa-192x192.png oluşturuldu');

  // 512x512 ikon
  console.log('📱 512x512 ikon oluşturuluyor...');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('✅ public/pwa-512x512.png oluşturuldu');

  // Apple touch icon (180x180)
  console.log('🍎 Apple touch icon oluşturuluyor...');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✅ public/apple-touch-icon.png oluşturuldu');

  // Favicon (32x32)
  console.log('🔖 Favicon oluşturuluyor...');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');
  console.log('✅ public/favicon.png oluşturuldu');

  // Maskable icon (512x512 with safe zone)
  console.log('🎭 Maskable ikon oluşturuluyor...');
  const maskableSvg = `
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Full background for maskable -->
    <rect width="512" height="512" fill="url(#grad2)"/>

    <!-- Safe zone içinde content -->
    <g transform="translate(102.4, 102.4)">
      <rect x="0" y="0" width="307.2" height="307.2" rx="40" fill="${bgColor}" opacity="0.95"/>
      <rect x="30" y="30" width="247.2" height="98" rx="8" fill="${primaryColor}" opacity="0.3"/>
      <rect x="80" y="170" width="147.2" height="28" rx="4" fill="${primaryColor}" opacity="0.5"/>
      <text x="153.6" y="110" font-family="system-ui" font-size="42"
            font-weight="bold" fill="${primaryColor}" text-anchor="middle">POS</text>
      <text x="153.6" y="280" font-family="system-ui" font-size="28"
            font-weight="600" fill="${bgColor}" text-anchor="middle">Sum</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512-maskable.png');
  console.log('✅ public/pwa-512x512-maskable.png oluşturuldu');

  console.log('\n🎉 Tüm ikonlar başarıyla oluşturuldu!\n');
  console.log('📂 Oluşturulan dosyalar:');
  console.log('   • public/pwa-192x192.png');
  console.log('   • public/pwa-512x512.png');
  console.log('   • public/pwa-512x512-maskable.png');
  console.log('   • public/apple-touch-icon.png');
  console.log('   • public/favicon.png');
}

generateIcons().catch(console.error);
