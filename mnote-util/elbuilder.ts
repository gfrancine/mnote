/*

el("div")
  .id("app")
  .class("blue")
  .class("big")
  .attr("atrribute", "value")
  .children(
    el("div").element,
    el("button"),
      .on("click", () => console.log("hey"))
      .element,
  ).element

*/

export class Elbuilder {
  element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  on<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.element.addEventListener(type, listener, options);
    return this;
  }

  off<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
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

  style(key: string, value: string) {
    this.element.style[key] = value;
    return this;
  }

  children(...els: HTMLElement[]) {
    els.forEach((el) => {
      this.element.appendChild(el);
    });
    return this;
  }

  parent(element: Element) {
    element.appendChild(this.element);
    return this;
  }
}

export function el(tag: string) {
  return new Elbuilder(document.createElement(tag));
}
