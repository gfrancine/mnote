const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const alias = require("esbuild-plugin-alias");

module.exports = function (entryPoints, isProduction) {
  esbuild
    .build({
      entryPoints,
      bundle: true,
      treeShaking: true,
      minify: isProduction,
      sourcemap: !isProduction,
      platform: "browser",
      outfile: "dist/bundle.js",
      loader: {
        ".ttf": "file",
        ".woff": "file",
        ".woff2": "file",
      },
      define: {
        "process.env.NODE_ENV": isProduction ? "'production'" : "'development'",
      },
      plugins: [
        sassPlugin(),
        alias({
          domain: require.resolve("domain-browser"),
        }),
      ],
    })
    .catch(console.error);
};
