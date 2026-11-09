import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Isolated installs keep the primary lockfile on the latest stable React.
for (const version of ['18.3.1', '19.3.1']) {
  const dir = resolve('.compat', `react-${version}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/package.json`, JSON.stringify({ private: true, type: 'module' }));
  execFileSync(
    'npm',
    [
      'install',
      '--prefix',
      dir,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      `react@${version}`,
      `react-dom@${version}`,
      `@types/react@${version.startsWith('18') ? '18' : '19'}`,
      `@types/react-dom@${version.startsWith('18') ? '18' : '19'}`,
    ],
    { stdio: 'inherit' },
  );
  console.log(`\nRunning full unit suite against React ${version}`);
  execFileSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run'], {
    stdio: 'inherit',
    env: { ...process.env, REACT_COMPAT_DIR: dir },
  });
  // Check the public declarations against the matching React type generation.
  writeFileSync(
    `${dir}/consumer.tsx`,
    `import { createRef, useRef } from 'react';\nimport { Rerousel, type RerouselHandle } from '../../lib/index.js';\nconst api = createRef<RerouselHandle>();\nexport function Consumer() { const item = useRef<HTMLDivElement>(null); return <Rerousel ref={api} itemRef={item} aria-label="Gallery"><div ref={item}>Slide</div></Rerousel>; }\n`,
  );
  writeFileSync(
    `${dir}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        lib: ['ES2020', 'DOM'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: ['react'],
        paths: {
          react: [`${dir}/node_modules/@types/react`],
          'react/jsx-runtime': [`${dir}/node_modules/@types/react/jsx-runtime.d.ts`],
        },
      },
      files: ['consumer.tsx'],
    }),
  );
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', `${dir}/tsconfig.json`], {
    stdio: 'inherit',
  });
}
