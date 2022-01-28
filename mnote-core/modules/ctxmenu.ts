import { Mnote } from "..";
import {
  Menu,
  MenuItem,
  sectionsToMenuItems,
} from "mnote-components/vanilla/menu";
import { CtxmenuContext } from "./types";

/* {
  name: "Copy",
  shortcut: "CTRL+1",
  click: () => {},
} */

type SectionReducer = (ctx: CtxmenuContext) => MenuItem[] | void;

export class CtxmenuModule {
  private reducers: SectionReducer[] = [];

  constructor(app: Mnote) {
    const getSections = (ctx: CtxmenuContext) => {
      const sections: MenuItem[][] = [];
      this.reducers.forEach((reducer) => {
        const section = reducer(ctx);
        if (section) sections.push(section);
      });
      return sections;
    };

    new ContextMenu(app.element, [app.modules.layout.contents], getSections);
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
    getSections: (context: CtxmenuContext) => MenuItem[][]
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

      const context: CtxmenuContext = {
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
        sectionsToMenuItems(sections)
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
