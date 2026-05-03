import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/app.ts',
    'src/server.ts',
    'src/env/**/*.ts',
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
    'src/repositories/**/*.ts',
    'src/use-cases/**/*.ts',
    'src/http/**/*.ts',
    'src/schemas/**/*.ts',
    'src/algorithms/**/*.ts',
    'src/scripts/**/*.ts',
    'src/@types/**/*.ts',
    '!src/examples/**/*.ts'  // Excluir pasta examples
  ],
  outDir: 'build',
  format: ['cjs'],
  clean: true,
  minify: false,
  sourcemap: true,
  // Configuração específica do esbuild para arquivos .http
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.http': 'text'  // Trata arquivos .http como texto simples
    }
  },
  // Usar configurações do tsconfig.json
  tsconfig: './tsconfig.json',
})