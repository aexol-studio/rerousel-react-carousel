import { build } from 'esbuild';
import { rm, mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await rm('lib', { recursive: true, force: true });
await mkdir('lib', { recursive: true });
for (const [format, extension] of [
  ['esm', 'js'],
  ['cjs', 'cjs'],
]) {
  await build({
    entryPoints: ['src/index.tsx'],
    outfile: `lib/index.${extension}`,
    bundle: true,
    format,
    platform: 'browser',
    target: 'es2020',
    minify: true,
    external: ['react', 'react/*'],
    jsx: 'automatic',
    banner: { js: '"use client";' },
    legalComments: 'none',
  });
}
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'], {
  stdio: 'inherit',
});

await copyFile('lib/index.d.ts', 'lib/index.d.cts');
