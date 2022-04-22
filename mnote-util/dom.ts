// utilities dealing with the DOM

import { Elbuilder } from "./elbuilder";

// string to html

const DOM_PARSER = new DOMParser();

export function toHtml(s: string): HTMLElement {
  const doc = DOM_PARSER.parseFromString(s, "text/html");
  return doc.body.childNodes[0] as HTMLElement;
}

// body freezing

let frozen = false;

export function freeze() {
  frozen = true;
  document.body.style["overflow"] = "hidden";
}

export function unfreeze() {
  frozen = false;
  document.body.style["overflow"] = "unset";
}

export function isFrozen(): boolean {
  return frozen;
}

// css

export const shortenSetProperty =
  (el: HTMLElement) => (property: string, value: string) =>
    el.style.setProperty(property, value);

export type Position = {
  point: {
    x: number;
    y: number;
  };
  anchor: {
    top: boolean;
    left: boolean;
  };
};

/** get anchor or origin for a floating element */
export const getPopupPosition = (
  containerWidth: number,
  containerHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) => ({
  point: {
    x,
    y, //todo
  },
  anchor: {
    top: y + height < containerHeight,
    left: x + width < containerWidth,
  },
});

export function applyPopupPositionToElement(
  element: HTMLElement,
  pos: Position
) {
  const builder = new Elbuilder(element);
  const rect = element.getBoundingClientRect();

  if (pos.anchor.top) {
    builder.style("top", pos.point.y + "px");
  } else {
    builder.style("top", pos.point.y - rect.height + "px");
  }

  if (pos.anchor.left) {
    builder.style("left", pos.point.x + "px");
  } else {
    builder.style("left", pos.point.x - rect.width + "px");
  }
}
