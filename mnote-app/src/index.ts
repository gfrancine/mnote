import { ExtensionsModule, Mnote } from "mnote-core";
import { FS } from "./fs";
import { System } from "./system";
import { invoke } from "@tauri-apps/api/tauri";
import { MarkdownExtension } from "mnote-extensions/markdown";
import "../styles.scss";

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
    .add(new MarkdownExtension(app));
})();
