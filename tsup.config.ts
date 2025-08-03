import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],       // Your hook entry file
  format: ["cjs", "esm"],        // Build both CommonJS and ESM
  dts: true,                     // Generate .d.ts files
  sourcemap: true,               // Source maps for debugging
  clean: true,                   // Clean dist before build
  target: "es2018",              // Good compatibility baseline
  splitting: false,              // Not needed for small lib
  minify: true,                // Easier to debug (optional)
  esbuildOptions(options) {
    options.drop = []; // don't drop 'console' or 'debugger'
    // options.treeShaking = false; // disable dead-code removal

  },
});
