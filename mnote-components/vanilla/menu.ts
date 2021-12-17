import { el, Elbuilder } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";

export type MenuItem = {
  name: string;
  shortcut?: string;
  click: (e: MouseEvent) => void;
};

type Anchor = {
  top: boolean;
  left: boolean;
};

type Point = {
  x: number;
  y: number;
};

export class Menu {
  element: HTMLElement;
  events: Emitter<{
    click(): void;
  }> = new Emitter();

  sections: MenuItem[][];
  getPosition: (rect: DOMRect) => {
    point: Point;
    anchor: Anchor;
  };

  constructor(
    getPosition: (rect: DOMRect) => {
      point: Point;
      anchor: Anchor;
    },
    sections: MenuItem[][]
  ) {
    this.getPosition = getPosition;
    this.sections = sections;

    const element = el("div").class("menu");

    const children: HTMLElement[] = [];

    sections.forEach((section, i) => {
      section.forEach((item) => {
        const itemEl = el("div")
          .class("menu-item")
          .children(
            el("div").class("menu-item-left").inner(item.name).element,
            el("div")
              .class("menu-item-right")
              .inner(item.shortcut || "").element
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
          }).element;

        children.push(itemEl);
      });

      if (i < sections.length - 1) {
        children.push(el("div").class("menu-divider").element);
      }
    });

    this.element = element.children(...children).element;
  }

  show(element: Element) {
    // todo wrap another container just to display none?
    element.appendChild(this.element);

    const builder = new Elbuilder(this.element);

    const rect = this.element.getBoundingClientRect();
    const position = this.getPosition(rect);

    if (position.anchor.top) {
      builder.style("top", position.point.y + "px");
    } else {
      builder.style("top", position.point.y - rect.height + "px");
    }

    if (position.anchor.left) {
      builder.style("left", position.point.x + "px");
    } else {
      builder.style("left", position.point.x - rect.width + "px");
    }
  }

  cleanup() {
    if (this.element.parentNode) {
      this.element = this.element.parentNode.removeChild(this.element);
    }
    this.events = new Emitter();
  }
}
