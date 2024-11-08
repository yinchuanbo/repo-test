import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";
import { resolve } from "node:path";

export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
  },
  plugins: [
    alias({
      entries: [{ find: "@js", replacement: resolve(__dirname, "repo/js") }],
    }),
    terser(),
  ],
};
