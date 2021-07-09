const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/bundle.js",
    plugins: [sassPlugin()],
  })
  .catch((e) => console.error(e.message));
