// utilities for DOM manipulation

const DOM_PARSER = new DOMParser();

// string to html

export function toHtml(s: string): HTMLElement {
  const doc = DOM_PARSER.parseFromString(s, "text/html");
  return doc.body;
}

// body freezing

let frozen: boolean = false;

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
