// Tạo icon PNG gốc (bong bóng chat + 3 chấm) bằng Playwright. Thay icons/*.png nếu muốn icon riêng.
import { chromium } from 'playwright';
import fs from 'node:fs';

const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="30" fill="#5B6CF0"/>
  <path d="M64 28c-19.9 0-36 14.3-36 32 0 9.6 4.7 18.2 12.2 24.1V100l13.6-7.5c3.3.9 6.8 1.4 10.2 1.4 19.9 0 36-14.3 36-32S83.9 28 64 28z" fill="#fff"/>
  <circle cx="49" cy="62" r="5.5" fill="#5B6CF0"/><circle cx="64" cy="62" r="5.5" fill="#5B6CF0"/><circle cx="79" cy="62" r="5.5" fill="#5B6CF0"/>
</svg>`;

fs.mkdirSync('icons', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const s of [16, 32, 48, 128]) {
  await page.setViewportSize({ width: s, height: s });
  await page.setContent(`<body style="margin:0;background:transparent">${svg(s)}</body>`);
  await page.screenshot({ path: `icons/icon-${s}.png`, omitBackground: true });
}
fs.writeFileSync('icons/icon.svg', svg(128));
await browser.close();
console.log('icons ok');
