const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

console.log('[BUILD] Starting PromptMMO Studio build for Vercel...');

// Recreate dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const staticFiles = [
  'index.html',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'manifest.json',
  'sw.js',
  'cloud-db.json',
  'MASTER_PROMPTS.md'
];

for (const file of staticFiles) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
    console.log(`[BUILD] Copied ${file} -> dist/${file}`);
  }
}

const staticDirs = ['js', 'img', 'demo', 'downloads'];
for (const dir of staticDirs) {
  const src = path.join(rootDir, dir);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(distDir, dir));
    console.log(`[BUILD] Copied ${dir}/ -> dist/${dir}/`);
  }
}

console.log('[BUILD] Build completed successfully! Output ready in dist/');
