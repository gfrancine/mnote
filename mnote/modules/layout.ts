// provides the draggable space layout for elements
// something like this:
// ______________________
// ----------------------
// |   |                |
// | 1 |       2        |
// |   |                |
// |   |                |
// ----------------------

import { Mnote /* , Module */ } from "../common/types";
import { el, Elbuilder } from "../common/elbuilder";
import Split from "../common/split";

// https://split.js.org/#/

export class LayoutModule /* implements Module */ {
  main: HTMLElement;
  menubar: HTMLElement;
  sidebar: HTMLElement;
  contents: HTMLElement;

  constructor(app: Mnote) {
    this.menubar = el("div")
      .class("layout-menubar")
      .element;

    this.sidebar = el("div")
      .class("layout-sidebar")
      .element;

    this.contents = el("div")
      .class("layout-contents")
      .element;

    const container = el("div")
      .class("layout-container")
      .children(
        this.sidebar,
        this.contents,
      )
      .element;

    this.main = el("div")
      .id("layout")
      .children(
        this.menubar,
        container,
      )
      .element;

    Split([this.sidebar, this.contents], {
      gutterSize: 5,
    });

    app.element.appendChild(this.main);
  }

  mountToSidebar(e: HTMLElement) {
    this.sidebar.innerHTML = "";
    this.sidebar.appendChild(e);
  }

  mountToContents(e: HTMLElement) {
    this.contents.innerHTML = "";
    this.contents.appendChild(e);
  }

  mountToMenubar(e: HTMLElement) {
    this.menubar.innerHTML = "";
    this.menubar.appendChild(e);
  }
}
