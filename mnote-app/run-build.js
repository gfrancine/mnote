const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const alias = require('esbuild-plugin-alias');

module.exports = function(entryPoints) {
  esbuild
  .build({
    entryPoints,
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
  .catch(console.error);
}