import { EditorsModule, Mnote } from "../../mnote";
import { FS } from "./fs";
import "../../mnote-styles/light.scss";

(async () => {
  const app = new Mnote("#root", {
    startFile: "D:\\Notes\\written\\sample.md",
    fs: new FS(),
  });

  await app.startup();

  // (app.modules.editors as EditorsModule).newEditor("plaintext");
})();
