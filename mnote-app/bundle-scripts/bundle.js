const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

module.exports = function (entryPoints, isProduction) {
  esbuild
    .build({
      entryPoints,
      bundle: true,
      minify: isProduction,
      sourcemap: !isProduction,
      outfile: "dist/bundle.js",
      loader: {
        ".ttf": "file",
        ".woff": "file",
        ".woff2": "file",
      },
      plugins: [sassPlugin()],
    })
    .catch(console.error);
};
