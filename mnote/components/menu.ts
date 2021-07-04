import { el } from "../common/elbuilder";
import { Emitter } from "../common/emitter";

export type MenuItem = {
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
    sections: MenuItem[][],
  ) {
    const element = el("div").class("menu");

    const children: HTMLElement[] = [];

    sections.forEach((section, i) => {
      section.forEach((item) => {

        const itemEl = el("div")
          .class("menu-item")
          .children(
            el("div")
              .class("menu-item-left")
              .inner(item.name)
              .element,
            el("div")
              .class("menu-item-right")
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

            // one of the listeners here will
            // close the context menu
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
            .class("menu-divider")
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

        // todo

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

  show(element: Element) {
    element.appendChild(this.element);
  }

  cleanup() {
    this.element = this.element.parentNode.removeChild(this.element);
    this.events = new Emitter();
  }
}


