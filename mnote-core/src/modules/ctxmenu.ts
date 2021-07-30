import { MenuItem, Mnote } from "../common/types";
import { Menu } from "../components/menu";
import { LayoutModule } from "./layout";
import { Context } from "./types";

/* {
  name: "Copy",
  shortcut: "CTRL+1",
  click: () => {},
} */

type SectionReducer = (ctx: Context) => MenuItem[] | void;

export class CtxmenuModule {
  ctxmenu: ContextMenu;
  app: Mnote;
  reducers: SectionReducer[] = [];

  constructor(app: Mnote) {
    this.app = app;

    const getSections = (ctx: Context) => {
      const sections: MenuItem[][] = [];
      this.reducers.forEach((reducer) => {
        const section = reducer(ctx);
        if (section) sections.push(section);
      });
      return sections;
    };

    this.ctxmenu = new ContextMenu(
      app.element,
      [(app.modules.layout as LayoutModule).contents],
      getSections,
    );
  }

  addSectionReducer(reducer: SectionReducer) {
    this.reducers.push(reducer);
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
          delete this.activeMenu; //?
          return;
        }
      }

      e.stopPropagation();
      e.preventDefault();

      const context: Context = {
        pageX: e.pageX,
        pageY: e.pageY,
        elements: document.elementsFromPoint(e.pageX, e.pageY),
      };

      const sections = getSections(context);

      if (sections.length < 1) {
        delete this.activeMenu;
        return;
      }

      if (this.activeMenu) {
        this.activeMenu.cleanup();
        delete this.activeMenu;
      }

      this.activeMenu = new Menu(
        (rect: DOMRect) => ({
          point: {
            x: e.pageX,
            y: e.pageY,
          },
          anchor: {
            top: e.pageY + rect.height < innerHeight,
            left: e.pageX + rect.width < innerWidth,
          },
        }),
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
      console.log("somewhereelse click");

      if (!this.activeMenu) return;

      const mouseoverEls = document.elementsFromPoint(e.pageX, e.pageY);
      if (mouseoverEls.indexOf(this.activeMenu.element) === -1) {
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
