import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  target: "node18",
  platform: "node",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
