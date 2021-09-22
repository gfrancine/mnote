// provides the draggable space layout for elements
// something like this:
// ______________________
// ----------------------
// |   |                |
// | 1 |       2        |
// |   |                |
// |   |                |
// ----------------------

import { Mnote } from "..";
import { el } from "mnote-util/elbuilder";

// https://split.js.org/#/

export class LayoutModule /* implements Module */ {
  main: HTMLElement;
  menubar: HTMLElement;
  sidebar: HTMLElement;
  fileSearchbar: HTMLElement;
  filetree: HTMLElement;
  openFiles: HTMLElement;
  sidebarMenu: HTMLElement;
  contents: HTMLElement;
  sidebarHandle: HTMLElement;

  constructor(app: Mnote) {
    this.menubar = (() => {
      return el("div")
        .class("layout-menubar")
        .element;
    })();

    this.sidebar = (() => {
      this.fileSearchbar = el("div")
        .class("sidebar-filesearch")
        .element;

      this.filetree = el("div")
        .class("sidebar-filetree")
        .element;

      this.openFiles = el("div")
        .class("sidebar-openfiles")
        .element;

      const contents = el("div")
        .class("sidebar-contents")
        .children(
          this.openFiles,
          this.filetree,
        )
        .element;

      this.sidebarMenu = el("div")
        .class("sidebar-menu")
        .element;

      return el("div")
        .class("layout-sidebar")
        .children(
          this.fileSearchbar,
          contents,
          this.sidebarMenu,
        )
        .element;
    })();

    this.sidebarHandle = el("div")
      .class("gutter")
      .class("gutter-horizontal")
      .element;

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
        this.sidebarHandle,
        container,
      )
      .element;

    app.element.appendChild(this.main);
  }

  mountToSidebarMenu(e: HTMLElement) {
    this.sidebarMenu.innerHTML = "";
    this.sidebarMenu.appendChild(e);
  }

  mountToFileSearchbar(e: HTMLElement) {
    this.fileSearchbar.innerHTML = "";
    this.fileSearchbar.appendChild(e);
  }

  mountToFiletree(e: HTMLElement) {
    this.filetree.innerHTML = "";
    this.filetree.appendChild(e);
  }

  mountToOpenFiles(e: HTMLElement) {
    this.openFiles.innerHTML = "";
    this.openFiles.appendChild(e);
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
