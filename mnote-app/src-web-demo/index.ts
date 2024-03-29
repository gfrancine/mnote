import { Mnote } from "mnote-core";
import { FS } from "./fs";
import "../styles.scss";

import { PlaintextExtension } from "mnote-extensions/plaintext";
import { SettingsExtension } from "mnote-extensions/settings";
import { SettingsInputsExamples } from "mnote-extensions/settings/examples";
import { MarkdownExtension } from "mnote-extensions/markdown";
import { ExcalidrawExtension } from "mnote-extensions/excalidraw";
import { KanbanExtension } from "mnote-extensions/kanban";
import { CalendarExtension } from "mnote-extensions/calendar";
import { TodoExtension } from "mnote-extensions/todo";
import { RichtextExtension } from "mnote-extensions/richtext";
import { ImageViewerExtension } from "mnote-extensions/image-viewer";
import { LinkViewerExtension } from "mnote-extensions/link-viewer";
import { contents, examplePdf } from "./mocks";
import { PdfViewerExtension } from "mnote-extensions/pdf-viewer";

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
    builtinExtensions: [
      new PlaintextExtension(),
      new SettingsExtension(),
      new SettingsInputsExamples(),
      new MarkdownExtension(),
      new ExcalidrawExtension(),
      new KanbanExtension(),
      new CalendarExtension(),
      new TodoExtension(),
      new RichtextExtension(),
      new ImageViewerExtension(contents.png),
      new LinkViewerExtension(),
      new PdfViewerExtension(examplePdf),
    ],
  });

  (window as unknown as { app: Mnote }).app = app;

  await app.init();
  await app.startup();
})();
