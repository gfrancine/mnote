const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const alias = require('esbuild-plugin-alias');

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "dist/bundle.js",
    plugins: [
      sassPlugin(),
      alias({
        "react": require.resolve("preact/compat"),
        "react-dom": require.resolve("preact/compat"),
      }),
    ],
  })
  .catch((e) => console.error(e.message));
