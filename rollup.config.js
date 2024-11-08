import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";
import { resolve } from "node:path";

export default {
  plugins: [
    alias({
      entries: [{ find: "@js", replacement: resolve(__dirname, "repo/js") }],
    }),
    terser(),
  ],
  treeshake: { moduleSideEffects: true },
};
