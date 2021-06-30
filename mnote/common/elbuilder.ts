/*

el("div")
  .id("app")
  .class("blue")
  .class("big")
  .attr("atrribute", "value")
  .children(
    el("div"),
    el("button"),
      .on("click", () => console.log("hey"))
  ).element

*/

class Elbuilder {
  element: Element;

  constructor(element: Element) {
    this.element = element;
  }

  on<K extends keyof ElementEventMap>(
    type: K,
    listener: (this: Element, ev: ElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.element.addEventListener(type, listener, options);
    return this;
  }

  off<K extends keyof ElementEventMap>(
    type: K,
    listener: (this: Element, ev: ElementEventMap[K]) => any,
  ) {
    this.element.removeEventListener(type, listener);
    return this;
  }

  attr(name: string, value: string) {
    this.element.setAttribute(name, value);
    return this;
  }

  id(id: string) {
    this.element.id = id;
    return this;
  }

  class(className: string) {
    this.element.classList.add(className);
    return this;
  }

  hook(fn: (e: Elbuilder) => void) {
    fn(this);
    return this;
  }

  inner(contents: string) {
    this.element.innerHTML = contents;
    return this;
  }

  children(...els: Elbuilder[]) {
    els.forEach((el) => {
      this.element.appendChild(el.element);
    });
  }
}

export function el(tag: string) {
  return new Elbuilder(document.createElement(tag));
}
