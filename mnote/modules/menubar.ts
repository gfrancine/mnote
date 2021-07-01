import { Mnote /* , Module */ } from "../common/types";
import { LayoutModule } from "./layout";

export class MenubarModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
    this.element = document.createElement("div");
    (app.modules.layout as LayoutModule).mountToMenubar(this.element);
  }

  setMenubarButtons() {}
}
