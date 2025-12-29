import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist/esm',
    clean: true,
    sourcemap: true,
    splitting: false,
    shims: false,
    esbuildOptions(options) {
      options.platform = 'node';
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    outDir: 'dist/cjs',
    clean: false,
    sourcemap: true,
    splitting: false,
    shims: false,
    esbuildOptions(options) {
      options.platform = 'node';
    },
  },
]); 