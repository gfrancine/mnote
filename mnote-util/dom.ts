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

/** get anchor or origin for a floating element */
export const getPopupAnchor = (
  containerWidth: number,
  containerHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) => ({
  top: y + height < containerHeight,
  left: x + width < containerWidth,
});

export function applyPopupAnchor(
  element: HTMLElement,
  x: number,
  y: number,
  width: number,
  height: number,
  left: boolean,
  top: boolean
) {
  const builder = new Elbuilder(element);

  if (top) {
    builder.style("top", y + "px");
  } else {
    builder.style("top", y - height + "px");
  }

  if (left) {
    builder.style("left", x + "px");
  } else {
    builder.style("left", x - width + "px");
  }
}
