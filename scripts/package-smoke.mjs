import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const dir = mkdtempSync(join(tmpdir(), 'rerousel-package-'));
try {
  const [pack] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', dir], {
      encoding: 'utf8',
    }),
  );
  const files = pack.files.map((file) => file.path);
  for (const file of [
    'lib/index.js',
    'lib/index.cjs',
    'lib/index.d.ts',
    'lib/index.d.cts',
    'LICENSE',
    'README.md',
    'CHANGELOG.md',
  ])
    assert.ok(files.includes(file), `Missing ${file}`);
  assert.ok(
    files.every((file) => /^(lib\/|LICENSE$|README.md$|CHANGELOG.md$|package.json$)/.test(file)),
    'Unexpected files in package',
  );
  for (const file of ['lib/index.js', 'lib/index.cjs'])
    assert.ok(
      readFileSync(file, 'utf8').startsWith('"use client";'),
      'Client directive must survive the package build',
    );
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  execFileSync(
    'npm',
    [
      'install',
      '--prefix',
      dir,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      join(dir, pack.filename),
      'react@19.3.1',
      'react-dom@19.3.1',
      '@types/react@19.3.0',
    ],
    { stdio: 'inherit' },
  );
  for (const [extension, imports] of [
    [
      'mjs',
      `import { Rerousel } from 'rerousel'; import { createElement } from 'react'; import { renderToString } from 'react-dom/server';`,
    ],
    [
      'cjs',
      `const { Rerousel } = require('rerousel'); const { createElement } = require('react'); const { renderToString } = require('react-dom/server');`,
    ],
  ]) {
    const test = join(dir, `smoke.${extension}`);
    writeFileSync(
      test,
      `${imports}\nif (typeof window !== 'undefined') throw Error('Expected real SSR environment');\nconst html = renderToString(createElement(Rerousel, { 'aria-label': 'SSR gallery' }, createElement('button', { id: 'unique' }, 'Live slide')));\nif (!html.includes('SSR gallery') || (html.match(/id="unique"/g) || []).length !== 1) throw Error('SSR smoke failed');\nconsole.log('${extension.toUpperCase()} import and server render passed');\n`,
    );
    execFileSync(process.execPath, [test], { stdio: 'inherit' });
  }
  for (const extension of ['mts', 'cts']) {
    const file = join(dir, `consumer.${extension}`);
    writeFileSync(
      file,
      `import { Rerousel, type RerouselHandle } from 'rerousel';\nimport { createElement, createRef } from 'react';\nconst ref = createRef<RerouselHandle>();\ncreateElement(Rerousel, { ref, 'aria-label': 'Typed consumer' }, 'Slide');\n`,
    );
    const config = join(dir, 'tsconfig.consumer.json');
    writeFileSync(
      config,
      JSON.stringify({
        compilerOptions: {
          noEmit: true,
          strict: true,
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          target: 'ES2022',
        },
        files: [file],
      }),
    );
    execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', config], { stdio: 'inherit' });
    console.log(`${extension.toUpperCase()} consumer types passed`);
  }
  console.log(
    JSON.stringify(
      { filename: pack.filename, files, packedBytes: pack.size, unpackedBytes: pack.unpackedSize },
      null,
      2,
    ),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
