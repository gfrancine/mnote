import { Mnote /* , Module */ } from "../common/types";
import { LayoutModule } from "./layout";
import { MenubarButton, MenuButton } from "./types";
import { el } from "../common/elbuilder";

import { ContextMenu } from "../components/ctxmenu";

// https://quilljs.com/docs/modules/toolbar/

export class MenubarModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;

    this.element = el("div")
      .class("menubar")
      .element;

    (app.modules.layout as LayoutModule).mountToMenubar(this.element);

    new ContextMenu(() => {
      return [
        [
          {
            name: "Save",
            shortcut: "CTRL+1",
            click: () => {},
          },
          {
            name: "Copy",
            shortcut: "CTRL+1",
            click: () => {},
          },
        ],
        [
          {
            name: "Save",
            shortcut: "CTRL+1",
            click: () => {},
          },
          {
            name: "Copy",
            shortcut: "CTRL+1",
            click: () => {},
          },
        ],
      ];
    });
  }

  setMenubarButtons(buttons: MenubarButton[]) {}

  setMenubarText(text: string) {}
}
