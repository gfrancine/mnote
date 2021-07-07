import { Mnote } from "../../mnote";
import { FS } from "./fs";
import { System } from "./system";
import { invoke } from "@tauri-apps/api/tauri";
import "../../mnote-styles/default.scss";

(async () => {
  const args = await invoke("get_args");
  const startPath = args[1];

  const app = new Mnote("#root", {
    startPath,
    fs: new FS(),
    system: await new System().init(),
  });

  await app.startup();
})();
