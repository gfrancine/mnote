import { Mnote } from "../../mnote";
import { FS } from "./fs";
import "../../mnote-styles/default.scss";

// web build
// for quick visual debugging

(async () => {
  const app = new Mnote("#root", {
    startPath: "startpath",
    fs: new FS(),
  });

  await app.startup();
})();
