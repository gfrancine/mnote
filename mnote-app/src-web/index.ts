import nodefill from "../nodefill";

import { ExtensionsModule, Mnote } from "mnote-core";
import { FS } from "./fs";
import "../styles.scss";

import { MarkdownExtension } from "mnote-extensions/markdown";
import { ExcalidrawExtension } from "mnote-extensions/excalidraw";
import { KanbanExtension } from "mnote-extensions/kanban";
import { CalendarExtension } from "mnote-extensions/calendar";

// run this so it gets bundled
console.log(nodefill);

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.startup();

  (app.modules.extensions as ExtensionsModule)
    .add(new MarkdownExtension(app))
    .add(new ExcalidrawExtension(app))
    .add(new KanbanExtension(app))
    .add(new CalendarExtension(app));
})();
