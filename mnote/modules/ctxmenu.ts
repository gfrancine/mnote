import { Mnote } from "../common/types";

import { Menu, MenuItem } from "../components/menu";

export class CtxmenuModule {
  ctxmenu: ContextMenu
  app: Mnote

  constructor(app: Mnote) {
    this.app = app;
    this.ctxmenu = new ContextMenu(
      app.element,
      () => {
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
}

export type Context = {
  pageX: number;
  pageY: number;
  element: Element;
};

export class ContextMenu {
  cleanup: () => void;
  activeMenu?: Menu;

  constructor(element: Element, getSections: (context: Context) => MenuItem[][]) {
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
        (rect: DOMRect) => {
          // top left if y + bottom

          return {
            top: false,
            left: false,
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
    document.addEventListener("click", onClick);

    this.cleanup = () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", onClick);
    };
  }
}