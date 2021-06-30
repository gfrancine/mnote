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

export class LayoutModule /* implements Module */ {
  constructor(app: Mnote) {}

  mountToSidebar(el: Element) {}

  mountToMain(el: Element) {}

  mountToMenubar(el: Element) {}
}
