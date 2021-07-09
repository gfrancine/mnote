import { Mnote } from "mnote-core";
import { FS } from "./fs";
import "../styles.scss";

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.startup();
})();
