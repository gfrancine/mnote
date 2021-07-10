This contains the faulty stylesheet that caused esbuild
to panic because it contains url() imports. The one here
has them commented out.

When installing dependencies, make sure to replace the
stylesheet in node_modules/hypermd/themes.