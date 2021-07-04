import { Mnote } from "../common/types";

import { Menu, MenuItem } from "../components/menu";
import { Context } from "./types";

export class CtxmenuModule {
  ctxmenu: ContextMenu;
  app: Mnote;
  buttons: [
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

  constructor(app: Mnote) {
    this.app = app;
    this.ctxmenu = new ContextMenu(
      app.element,
      (ctx: Context) => {
        return this.buttons;
      },
    );
  }
}

export class ContextMenu {
  cleanup: () => void;
  activeMenu?: Menu;

  constructor(
    element: Element,
    getSections: (context: Context) => MenuItem[][],
  ) {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      if (this.activeMenu) {
        this.activeMenu.cleanup();
        delete this.activeMenu;
      }

      const context: Context = {
        pageX: e.pageX,
        pageY: e.pageY,
        element: document.elementFromPoint(e.pageX, e.pageY),
      };

      const sections = getSections(context);

      this.activeMenu = new Menu(
        {
          x: e.pageX,
          y: e.pageY,
        },
        (rect: DOMRect /*, pos */) => {
          return {
            top: e.pageY + rect.height < innerHeight,
            left: e.pageX + rect.width < innerWidth,
          };
        },
        sections,
      );

      this.activeMenu.events.on("click", () => {
        if (this.activeMenu) {
          this.activeMenu.cleanup();
          delete this.activeMenu;
        }
      });

      this.activeMenu.show(element);
    };

    const onClick = (e: MouseEvent) => {
      if (!this.activeMenu) return;

      if (e.target !== this.activeMenu.element) {
        this.activeMenu.cleanup();
        delete this.activeMenu;
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("mousedown", onClick);

    this.cleanup = () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("mousedown", onClick);
    };
  }
}
