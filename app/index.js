import { Mnote } from "../mnote";
import "../mnote-styles/light.scss";

const app = new Mnote("#root");

app.modules.editors.newEditor("plaintext");
