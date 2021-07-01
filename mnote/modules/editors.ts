import { Mnote /* , Module */ } from "../common/types";
import { LayoutModule } from "./layout";

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor-api-basics

export class EditorsModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;
  currentEditor: undefined;

  constructor(app: Mnote) {
    this.app = app;
    this.element = document.createElement("div");
    (app.modules.layout as LayoutModule).mountToMenubar(this.element);
  }
}
