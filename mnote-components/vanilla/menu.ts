import { applyPopupPositionToElement } from "mnote-util/dom";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";

export type MenuItem = {
  name: string;
  click: (e: MouseEvent) => void;
  shortcut?: string;
  icon?: (fillClass: string, strokeClass: string) => Element | undefined;
};

export type MenuItemList = (MenuItem | "divider")[];

type Anchor = {
  top: boolean;
  left: boolean;
};

type Point = {
  x: number;
  y: number;
};

// ctxmenu and menubar modules still use MenuItem[][]
export function sectionsToMenuItems(sections: MenuItem[][]) {
  let items: MenuItemList = [];
  sections.forEach((section, i) => {
    items = items.concat(section);
    if (i < sections.length - 1) items.push("divider");
  });
  return items;
}

export class Menu {
  element: HTMLElement;
  events: Emitter<{
    click(): void;
  }> = new Emitter();

  itemList: MenuItemList;

  getPosition: (rect: DOMRect) => {
    point: Point;
    anchor: Anchor;
  };

  constructor(
    getPosition: (rect: DOMRect) => {
      point: Point;
      anchor: Anchor;
    },
    itemList: MenuItemList,
    title?: string
  ) {
    this.getPosition = getPosition;
    this.itemList = itemList;

    const element = el("div").class("menu");

    const children: HTMLElement[] = [];

    if (title) {
      children.push(el("div").class("menu-title").inner(title).element);
    }

    itemList.forEach((item) => {
      if (item === "divider") {
        children.push(el("hr").class("menu-divider").element);
        return;
      }

      const itemEl = el("button")
        .class("menu-item")
        .children(
          el("div")
            .class("menu-item-left")
            .hook((e) => {
              const icon = item.icon?.("fill", "stroke");
              if (icon) {
                e.children(
                  el("div").class("menu-item-left-icon").children(icon).element
                );
              }
            })
            .children(
              el("div").class("menu-item-left-text").inner(item.name).element
            ).element,
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

    this.element = element.children(...children).element;
  }

  show(element: Element) {
    element.appendChild(this.element);

    const rect = this.element.getBoundingClientRect();
    const position = this.getPosition(rect);

    applyPopupPositionToElement(this.element, position);
  }

  cleanup() {
    if (this.element.parentNode) {
      this.element = this.element.parentNode.removeChild(this.element);
    }
    this.events = new Emitter();
  }
}
