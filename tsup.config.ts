import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  target: 'es2020',
  clean: true,
  splitting: false,
  minifyWhitespace: true,
  minifySyntax: true,
  noExternal: ['howler'],
  esbuildOptions(options) {
    options.legalComments = 'none'
  },
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' }
  },
})
