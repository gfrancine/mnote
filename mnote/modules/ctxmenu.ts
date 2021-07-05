import { Mnote } from "../common/types";
import { Menu, MenuItem } from "../components/menu";
import { LayoutModule } from "./layout";
import { Context } from "./types";

export class CtxmenuModule {
  ctxmenu: ContextMenu;
  app: Mnote;
  buttons = [
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
      [(app.modules.layout as LayoutModule).contents],
      (ctx: Context) => {
        return this.buttons;
      },
    );
  }
}

export class ContextMenu {
  cleanup: () => void;
  activeMenu?: Menu;
  blacklist: Set<Element>;

  constructor(
    element: Element,
    blacklist: Element[],
    getSections: (context: Context) => MenuItem[][],
  ) {
    this.blacklist = new Set(blacklist);

    const onContextMenu = (e: MouseEvent) => {
      for (const elm of document.elementsFromPoint(e.pageX, e.pageY)) {
        if (this.blacklist.has(elm)) {
          return;
        }
      }

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

  addBlacklist(e: Element) {
    this.blacklist.add(e);
  }
}
