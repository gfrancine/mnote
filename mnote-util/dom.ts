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
) => {
  const anchor = {
    top: y < containerHeight / 2,
    left: x < containerWidth / 2,
  };

  const point = { x, y };

  if (anchor.left && x + width > containerWidth) {
    point.x = containerWidth - width;
  } else if (!anchor.left && x - width < 0) {
    point.x = containerWidth - (containerWidth - width);
  }

  if (anchor.top && y + height > containerWidth) {
    point.y = containerHeight - height;
  } else if (!anchor.top && y - height < 0) {
    point.y = containerHeight - (containerHeight - height);
  }

  return { anchor, point };
};

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
