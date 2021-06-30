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
import { el } from "../common/elbuilder";
import Split from "../common/split";

export class LayoutModule /* implements Module */ {
  main: Element;

  constructor(app: Mnote) {
    this.main = el("div")
      .id("layout-main")
      .element;

    app.element.appendChild(this.main);
  }

  mountToSidebar(e: Element) {}

  mountToMain(e: Element) {}

  mountToMenubar(e: Element) {}
}
