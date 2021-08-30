import { Mnote } from "mnote-core";
import { FS } from "./fs";
import { System } from "./system";
import { invoke } from "@tauri-apps/api/tauri";
import "../styles.scss";

import { PlaintextExtension } from "mnote-extensions/plaintext";
import { SettingsExtension } from "mnote-extensions/settings";
import { MarkdownExtension } from "mnote-extensions/markdown";
import { ExcalidrawExtension } from "mnote-extensions/excalidraw";
import { KanbanExtension } from "mnote-extensions/kanban";
import { CalendarExtension } from "mnote-extensions/calendar";
import { TodoExtension } from "mnote-extensions/todo";

(async () => {
  const args: string[] = await invoke("get_args");
  const startPath = args[1];

  const app = new Mnote("#root", {
    startPath,
    fs: await new FS().init(),
    system: await new System().init(),
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
  ]);

  await app.startup();
})();
