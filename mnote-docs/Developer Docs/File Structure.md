# File Structure

- Mnote uses npm workspaces.
- All the packages that end up in the compiled app are prefixed with "mnote-".

## Dependency order

Each package in this list should ideally not know the existence of the packages above it:

1. mnote-app
2. mnote-extensions
3. mnote-styles
4. mnote-core
5. mnote-components
6. mnote-util
7. mnote-deps

## mnote-deps

- For forked dependencies written by other people.
- If the dependency is here because it's not in NPM, or if only small changes were made, linting can be disabled.
- Make sure the original author's copyright notice is included.

## mnote-util

- For small utilities that aren't components and could be used by >1 packages.

## mnote-components

- Has vanilla/react components and styles that are meant to be used both by the core and extensions

- Stylesheets are placed next to their components. They should export SCSS mixins that take a theme map.

## mnote-core

- Core exports an Mnote app class that needs a backend passed to it.

- The core 
- Has two folders, common and modules.

- common currently only contains types that aren't consumed by the modules. There used to be an extension and utils folder inside core and shared items are placed in common.

- There should not be any more directories inside modules. If a module needs multiple files,  it should be prefixed with the module name.

## mnote-styles

- Contains the stylesheets for the core package
- Styles are imported by mnote-app, not the core package

- mnote-vars.scss exports a map to get the CSS variable name of a theme variable. All it does it prefix it with "--mnote-". For example:

```scss
@use "~mnote-styles/mnote-vars" as mn;

.code-fence {
  font-family: map-get(mn.$vars, font-monospace);
  background: map-get(mn.$vars, main-bg-secondary);
}
```

- Also exports reusable styles that depend on mnote-vars for use in extensions, e.g. mnote-rich-text.scss (for elements like lists, code fences, etc.) and mnote-inputs.scss. 
- mnote-styles/components/ are for applying theme variables to components in mnote-components.
- mnote-styles/modules/ should correspond to the mnote-core module.

## mnote-extensions

- For extensions that are ran with the Extensions module.
- Extensions are bundled together with the core in the mnote-app package. 
- A note: the core provides base functionalities like a user interface, an editor API, etc. Extensions can hopefully add more domain-specific features, e.g. a citation list editor and a TeX editor for an academic writing software built with the Mnote core, etc.

## mnote-app

- This is the entry point for the entire app.

- The Mnote core is backend-agnostic. This package has the tauri backend (src-tauri and src-tauri-frontend) and the web demo backend (src-web-demo).

- Tauri app

  - Mnote uses Tauri as the desktop app framework.

  - src-tauri-frontend has the frontend's entry point. It also contains the FsModule and SystemModule backends needed by the core Mnote class. Both run Tauri commands.
  - src-tauri is the Rust crate. The final app binary can be found in src-tauri/target.

- Web demo

  - Compiling the desktop app takes a while. The web demo is meant for quick iteration when changes are only in the front end. It just serves the files in a local server.
  - The web demo bundles with a mocked "file system". When reading a file, it returns data based on the file extension.

- bundle-scripts

  - JS scripts for bundling the frontend (HTML/JS/CSS)
  - bundle.js exports a function that runs esbuild. It can be configured for development/production.
  - The rest of the scripts correspond to their package.json script.





