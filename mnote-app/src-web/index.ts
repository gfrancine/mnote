import { ExtensionsModule, Mnote } from "mnote-core";
import { FS } from "./fs";
import "../styles.scss";

import { MarkdownExtension } from "mnote-extensions/markdown";

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.startup();

  (app.modules.extensions as ExtensionsModule)
    .add(new MarkdownExtension(app));
})();
