import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: 'src/index.tsx',
            name: 'Rerousel',
            fileName: (format) => `rerousel.${format}.js`,
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            treeshake: true,
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
        target: 'esnext',
        minify: 'esbuild', // Use esbuild for smaller bundles
        sourcemap: false, // Remove sourcemaps
        cssCodeSplit: true, // Remove unused CSS
        reportCompressedSize: false, // Skip compressed size reporting
    },
});
