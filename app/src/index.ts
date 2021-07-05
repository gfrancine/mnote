import { EditorsModule, Mnote } from "../../mnote";
import { FS } from "./fs";
import "../../mnote-styles/light.scss";

(async () => {
  const app = new Mnote("#root", {
    startDir: "C:\\Users\\Administrator\\Desktop\\notes",
    fs: new FS(),
  });

  await app.startup();

  // (app.modules.editors as EditorsModule).newEditor("plaintext");
})();
