import fs from 'node:fs';
import path from 'node:path';

const targetDir = path.join(process.cwd(), 'public', 'geo');
fs.mkdirSync(targetDir, { recursive: true });

const srcGeo = path.join(process.cwd(), 'node_modules', 'world-atlas', 'countries-110m.json');
const destGeo = path.join(targetDir, 'countries-110m.json');

const srcLicense = path.join(process.cwd(), 'node_modules', 'world-atlas', 'LICENSE');
const destLicense = path.join(targetDir, 'LICENSE-world-atlas');

if (fs.existsSync(srcGeo)) {
  fs.copyFileSync(srcGeo, destGeo);
}

if (fs.existsSync(srcLicense)) {
  fs.copyFileSync(srcLicense, destLicense);
}

console.log('✓ Geo assets successfully copied from world-atlas to public/geo/');
