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
import { RichtextExtension } from "mnote-extensions/richtext";
import { ImageViewerExtension } from "mnote-extensions/image-viewer";
import { LinkViewerExtension } from "mnote-extensions/link-viewer";

export const run = async (isProduction: boolean) => {
  const args: string[] = await invoke("get_args");
  const startPath = args[1];

  const app = new Mnote("#root", {
    startPath,
    fs: await new FS().init(),
    system: await new System().init(),
    isProduction,
  });

  if (!isProduction) {
    (window as unknown as { app: Mnote }).app = app;
  }

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
    new ImageViewerExtension(),
    new LinkViewerExtension(),
  ]);

  await app.startup();
};
