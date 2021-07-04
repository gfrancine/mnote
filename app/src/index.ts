import { EditorsModule, Mnote } from "../../mnote";
import { FS } from "./fs";
import "../mnote-styles/light.scss";

const app = new Mnote("#root", {
  fs: new FS(),
});

(app.modules.editors as EditorsModule).newEditor("plaintext");
