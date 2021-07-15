import nodefill from "../nodefill";

import { ExtensionsModule, Mnote } from "mnote-core";
import { FS } from "./fs";
import { System } from "./system";
import { invoke } from "@tauri-apps/api/tauri";
import "../styles.scss";

import { MarkdownExtension } from "mnote-extensions/markdown";
import { ExcalidrawExtension } from "mnote-extensions/excalidraw";
import { KanbanExtension } from "mnote-extensions/kanban";

// run this so it gets bundled
console.log(nodefill);

(async () => {
  const args = await invoke("get_args");
  const startPath = args[1];

  const app = new Mnote("#root", {
    startPath,
    fs: await new FS().init(),
    system: await new System().init(),
  });

  await app.startup();

  (app.modules.extensions as ExtensionsModule)
    .add(new MarkdownExtension(app))
    .add(new ExcalidrawExtension(app))
    .add(new KanbanExtension(app));
})();
