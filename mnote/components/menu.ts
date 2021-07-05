import { el, Elbuilder } from "../common/elbuilder";
import { Emitter } from "../common/emitter";
import { MenuItem } from "../common/types";

type Anchor = {
  top: boolean;
  left: boolean;
};

type Position = {
  x: number;
  y: number;
};

export class Menu {
  element: HTMLElement;
  events: Emitter<{
    click(): void;
  }> = new Emitter();
  sections: MenuItem[][];
  position: Position;
  getAnchor: (rect: DOMRect, pos: Position) => Anchor;

  constructor(
    position: Position,
    getAnchor: (rect: DOMRect, pos: Position) => Anchor,
    sections: MenuItem[][],
  ) {
    this.getAnchor = getAnchor;
    this.position = position;
    this.sections = sections;

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
              .inner(item.shortcut || "")
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
      .element;
  }

  show(element: Element) {
    // todo wrap another container just to display none?
    element.appendChild(this.element);

    const builder = new Elbuilder(this.element);

    const rect = this.element.getBoundingClientRect();
    const anchor = this.getAnchor(rect, this.position);

    if (anchor.top) {
      builder
        .style("top", this.position.y + "px");
    } else {
      builder
        .style("top", (this.position.y - rect.height) + "px");
    }

    if (anchor.left) {
      builder
        .style("left", this.position.x + "px");
    } else {
      builder
        .style("left", (this.position.x - rect.width) + "px");
    }
  }

  cleanup() {
    console.log("menu: cleanup", this.element, this.element.parentNode);
    this.element = this.element.parentNode.removeChild(this.element);
    this.events = new Emitter();
  }
}
