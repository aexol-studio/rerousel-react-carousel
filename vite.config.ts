import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
const compat = process.env.REACT_COMPAT_DIR;
export default defineConfig(({ mode }) => ({
  server: mode === 'browser-test' ? { hmr: false, watch: null } : undefined,
  resolve: {
    alias: {
      rerousel: resolve('lib/index.js'),
      ...(compat
        ? {
            'react-dom': resolve(compat, 'node_modules/react-dom'),
            react: resolve(compat, 'node_modules/react'),
          }
        : {}),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: { outDir: 'dist', target: 'es2020' },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
  },
}));
