import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
const source = readFileSync('lib/index.js');
const report = {
  version: JSON.parse(readFileSync('package.json')).version,
  esm: source.length,
  gzip: gzipSync(source, { level: 9 }).length,
  brotli: brotliCompressSync(source).length,
  runtimeDependencies: 0,
  gzipBudget: 2675,
};
console.log(JSON.stringify(report, null, 2));
if (report.gzip > report.gzipBudget)
  throw new Error(`Gzip budget exceeded: ${report.gzip} > ${report.gzipBudget}`);
writeFileSync('lib/size.json', JSON.stringify(report, null, 2) + '\n');
