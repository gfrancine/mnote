const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

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
    ],
  })
  .catch(console.error);
}