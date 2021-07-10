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
import { el } from "mnote-util/elbuilder";
import Split from "mnote-deps/split";

// https://split.js.org/#/

export class LayoutModule /* implements Module */ {
  main: HTMLElement;
  menubar: HTMLElement;
  sidebar: HTMLElement;
  filetree: HTMLElement;
  sidebarMenu: HTMLElement;
  contents: HTMLElement;

  constructor(app: Mnote) {
    this.menubar = (() => {
      return el("div")
        .class("layout-menubar")
        .element;
    })();

    this.sidebar = (() => {
      this.filetree = el("div")
        .class("sidebar-filetree")
        .element;

      this.sidebarMenu = el("div")
        .class("sidebar-menu")
        .element;

      return el("div")
        .class("layout-sidebar")
        .children(
          this.filetree,
          this.sidebarMenu,
        )
        .element;
    })();

    this.contents = (() => {
      return el("div")
        .class("layout-contents")
        .element;
    })();

    const container = el("div")
      .class("layout-container")
      .children(
        this.menubar,
        this.contents,
      )
      .element;

    this.main = el("div")
      .class("layout")
      .children(
        this.sidebar,
        container,
      )
      .element;

    Split([this.sidebar, container], {
      gutterSize: 5,
      sizes: [20, 80], // in %
    });

    app.element.appendChild(this.main);
  }

  mountToSidebarMenu(e: HTMLElement) {
    this.sidebarMenu.innerHTML = "";
    this.sidebarMenu.appendChild(e);
  }

  mountToFiletree(e: HTMLElement) {
    this.filetree.innerHTML = "";
    this.filetree.appendChild(e);
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
