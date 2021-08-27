import nodefill from "../nodefill";

import { Mnote } from "mnote-core";
import { FS } from "./fs";
import "../styles.scss";

import { PlaintextExtension } from "mnote-extensions/plaintext";
import { SettingsExtension } from "mnote-extensions/settings";
import { MarkdownExtension } from "mnote-extensions/markdown";
import { ExcalidrawExtension } from "mnote-extensions/excalidraw";
import { KanbanExtension } from "mnote-extensions/kanban";
import { CalendarExtension } from "mnote-extensions/calendar";
import { TodoExtension } from "mnote-extensions/todo";

// run this so it gets bundled
console.log(nodefill);

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.init();

  const extensions = app.modules.extensions;
  await Promise.all([
    extensions.add(new PlaintextExtension(app)),
    extensions.add(new SettingsExtension(app)),
    extensions.add(new MarkdownExtension(app)),
    extensions.add(new ExcalidrawExtension(app)),
    extensions.add(new KanbanExtension(app)),
    extensions.add(new CalendarExtension(app)),
    extensions.add(new TodoExtension(app)),
  ]);

  await app.startup();
})();
