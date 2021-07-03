import { el, Elbuilder } from "../common/elbuilder";
import { Emitter } from "../common/emitter";

export type Item = {
  name: string;
  shortcut: string;
  click(e: MouseEvent): void;
};

type Anchor = {
  top: boolean;
  left: boolean;
};

export class Menu {
  element: HTMLElement;
  events: Emitter<{
    click(): void;
  }> = new Emitter();

  constructor(
    position: {
      x: number;
      y: number;
    },
    getAnchor: (rect: DOMRect) => Anchor,
    sections: Item[][],
  ) {
    const element = el("div").class("ctxmenu");

    const children: HTMLElement[] = [];

    sections.forEach((section, i) => {
      section.forEach((item) => {
        const itemEl = el("div")
          .class("ctxmenu-item")
          .children(
            el("div")
              .class("ctxmenu-item-left")
              .inner(item.name)
              .element,
            el("div")
              .class("ctxmenu-item-right")
              .inner(item.shortcut)
              .element,
          )
          .on("click", (e) => {
            let caughtErr;
            try {
              item.click(e);
            } catch (err) {
              caughtErr = err;
            }
            this.events.emit("click");
            if (caughtErr !== undefined) {
              throw caughtErr;
            }
          })
          .element;

        children.push(itemEl);
      });

      if (i < sections.length - 1) {
        children.push(
          el("div")
            .class("ctxmenu-divider")
            .element,
        );
      }
    });

    this.element = element
      .children(...children)
      .hook((ebuilder) => {
        const rect = ebuilder.element.getBoundingClientRect();
        const anchor = getAnchor(rect);

        const posAnchor: number[] = [];

        if (anchor.top) {
          ebuilder
            .style("top", position.y + "px");
          posAnchor[0] = 0;
        } else {
          ebuilder
            .style("top", (rect.bottom - rect.top + position.y) + "px");
          posAnchor[0] = 100;
        }

        if (anchor.left) {
          ebuilder
            .style("left", position.x + "px");
          posAnchor[1] = 0;
        } else {
          ebuilder
            .style("left", (rect.right - rect.left + position.x) + "px");
          posAnchor[1] = 100;
        }

        ebuilder
          .style("position-anchor", `${posAnchor[0]}% ${posAnchor[1]}%`);
      })
      .element;
  }

  show() {
    document.body.appendChild(this.element);
  }

  cleanup() {
    this.element = this.element.parentNode.removeChild(this.element);
    this.events = new Emitter();
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

  constructor(getSections: (context: Context) => Item[][]) {
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

      this.activeMenu.show();
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
