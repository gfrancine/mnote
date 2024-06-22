# Extensions, 31/7/2022

- Extensions are folders in the `<data dir>/extensions` directory.
- Every extension should have an `extension.json` file in the root directory. The paths in the `main` and `stylesheets` keys should be relative to the root folder.

```json
{
  	"main": "index.js",
  	"stylesheets": ["index.css"]
}
```

- As of now, an extension can only be a single, bundled ES module file ( `index.js`). Internally, it would be read then loaded from string with a dynamic import. The default export must be an object that matches the `Extension` type:

```js
export default {
	startup: (app) => {
		app.modules.popups.notify("Notification")
	},
  cleanup: () => {}
}
```

- d

