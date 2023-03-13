import { defineConfig } from "tsup";

const isDev = process.env.npm_lifecycle_event === "dev";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: "cjs",
  minify: !isDev,
  target: "esnext",
  outDir: "dist",
});
