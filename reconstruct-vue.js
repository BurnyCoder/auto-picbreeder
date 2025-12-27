const fs = require('fs');
const path = require('path');

const outputDir = './picbreeder-dev/src';
const mapFiles = [
  './js/app.a4dbf107.js.map',
  './js/evolve.f8d8b2ad.js.map',
  './js/explore.7a9ef957.js.map',
  './js/about.87ed1d02.js.map',
  './js/chunk-vendors.0cde93f7.js.map',
];

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Extract original sources from source maps
function extractOriginalSources() {
  const sources = new Map();

  for (const mapFile of mapFiles) {
    console.log(`Processing: ${mapFile}`);
    const mapData = JSON.parse(fs.readFileSync(mapFile, 'utf8'));

    if (!mapData.sources || !mapData.sourcesContent) continue;

    mapData.sources.forEach((src, i) => {
      const content = mapData.sourcesContent[i];
      if (!content) return;

      // Match both webpack:///src/ and webpack:///./src/ patterns
      let cleanPath = null;
      if (src.startsWith('webpack:///src/') && !src.includes('?')) {
        cleanPath = src.replace('webpack:///', '');
      } else if (src.startsWith('webpack:///./src/') && !src.includes('?')) {
        cleanPath = src.replace('webpack:///./', '');
      }

      if (cleanPath) {
        // Check if this is the original file (contains <template> or proper JS)
        const isVue = cleanPath.endsWith('.vue') && content.includes('<template>');
        const isJS = cleanPath.endsWith('.js') && (content.includes('import ') || content.includes('export '));

        if (isVue || isJS) {
          // Prefer longer content (more complete)
          if (!sources.has(cleanPath) || content.length > sources.get(cleanPath).length) {
            sources.set(cleanPath, content);
          }
        }
      }
    });
  }

  return sources;
}

// Main
ensureDir(outputDir);
ensureDir(path.join(outputDir, 'views'));
ensureDir(path.join(outputDir, 'components'));
ensureDir(path.join(outputDir, 'router'));
ensureDir(path.join(outputDir, 'lib'));
ensureDir(path.join(outputDir, 'assets'));

console.log('Extracting original sources from source maps...\n');
const sources = extractOriginalSources();

// Write extracted sources
for (const [filePath, content] of sources) {
  const outPath = path.join(outputDir, filePath.replace('src/', ''));
  const outDir = path.dirname(outPath);
  ensureDir(outDir);

  fs.writeFileSync(outPath, content);
  console.log(`Created: ${filePath}`);
}

// Copy lib files from src-extracted
const libSrcDir = './src-extracted/src/lib';
const libOutDir = path.join(outputDir, 'lib');
for (const f of fs.readdirSync(libSrcDir)) {
  if (f.endsWith('.js')) {
    fs.copyFileSync(path.join(libSrcDir, f), path.join(libOutDir, f));
    console.log(`Copied: lib/${f}`);
  }
}

// Copy assets from src-extracted
const assetsDir = './src-extracted/src/assets';
const assetsOutDir = path.join(outputDir, 'assets');
for (const f of fs.readdirSync(assetsDir)) {
  if (!f.includes('?')) {
    const src = path.join(assetsDir, f);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(assetsOutDir, f));
    }
  }
}
console.log('Copied assets');

// Copy global CSS
fs.copyFileSync('./css/app.e3289aa8.css', path.join(assetsOutDir, 'app.css'));
console.log('Copied: app.css');

console.log('\n✓ Reconstruction complete!');
console.log(`\nFound ${sources.size} original source files`);
