import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DATA_FILE = path.resolve('./public/data/publications.json');
const GZ_FILE = `${DATA_FILE}.gz`;
const BR_FILE = `${DATA_FILE}.br`;

export function compressData() {
  if (!fs.existsSync(DATA_FILE)) {
    console.warn(`Data file not found at ${DATA_FILE}`);
    return;
  }

  const content = fs.readFileSync(DATA_FILE);
  console.log(`Compressing ${DATA_FILE} (${(content.length / 1024 / 1024).toFixed(2)} MB)...`);

  const gzip = zlib.gzipSync(content, { level: 9 });
  fs.writeFileSync(GZ_FILE, gzip);
  console.log(`Created ${GZ_FILE} (${(gzip.length / 1024 / 1024).toFixed(2)} MB)`);

  const brotli = zlib.brotliCompressSync(content, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    },
  });
  fs.writeFileSync(BR_FILE, brotli);
  console.log(`Created ${BR_FILE} (${(brotli.length / 1024 / 1024).toFixed(2)} MB)`);
}

// Run directly if invoked as main module
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('./scripts/compress-data.mjs')) {
  compressData();
}
