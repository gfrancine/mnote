// utilities dealing with the DOM

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
