import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    restoreMocks: true,
    clearMocks: true,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      // focar apenas nos use-cases no relatório de cobertura
      include: ["src/use-cases/**/*.{ts,tsx}"],
      // excluir schemas e factories dos use-cases para não poluir a cobertura
      exclude: [
        "src/tests/**/*",
        "**/*.spec.ts",
        "**/*.test.ts",
        "src/use-cases/factories/**",
        "src/use-cases/@factories/**",
        "src/schemas/**",
      ],
    },
    projects: [
      {
        plugins: [tsconfigPaths()],
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
        test: {
          name: "unit",
          include: ["src/tests/unit/**/*.spec.ts"],
          environment: "node",
        },
      },
      {
        plugins: [tsconfigPaths()],
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
        test: {
          name: "e2e",
          include: ["src/tests/e2e/**/*.spec.ts"],
          environment: fileURLToPath(
            new URL("./src/tests/infra/prisma/prisma-test-environment.ts", import.meta.url)
          ),
          sequence: {
            concurrent: false,
          },
        },
      },
    ],
  },
});
