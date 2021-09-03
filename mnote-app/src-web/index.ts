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
import { RichtextExtension } from "mnote-extensions/richtext";

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.init();

  await app.modules.extensions.addAll([
    new PlaintextExtension(),
    new SettingsExtension(),
    new MarkdownExtension(),
    new ExcalidrawExtension(),
    new KanbanExtension(),
    new CalendarExtension(),
    new TodoExtension(),
    new RichtextExtension(),
  ]);

  await app.startup();
})();
