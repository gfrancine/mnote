import { MenuItem, Mnote /* , Module */ } from "../common/types";
import { LayoutModule } from "./layout";
import { el } from "../common/elbuilder";
import { Menu } from "../components/menu";

// https://quilljs.com/docs/modules/toolbar/

export class MenubarModule /* implements Module */ {
  layout: LayoutModule;

  element: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  app: Mnote;

  menuToggle: HTMLElement;
  menuButtons: MenuItem[][] = [];
  menuCurrent?: Menu;

  constructor(app: Mnote) {
    this.app = app;

    this.left = el("div")
      .class("menubar-left")
      .element;

    const menuToggle = el("div")
      .class("menubar-menu-toggle")
      .inner("svg here")
      .element;

    this.right = el("div")
      .class("menubar-right")
      .children(menuToggle)
      .element;

    this.element = el("div")
      .class("menubar")
      .children(
        this.left,
        this.right,
      )
      .element;

    this.layout = app.modules.layout as LayoutModule;
    this.layout.mountToMenubar(this.element);
  }

  toggleMenu() {
    if (this.menuCurrent) {
      delete this.menuCurrent;
      this.menuCurrent.cleanup();
    } else {
      const toggleRect = this.menuToggle.getBoundingClientRect();
      const menu = new Menu({
        x: toggleRect.right,
        y: toggleRect.bottom,
      }, () => {
        return { top: true, left: false };
      }, this.menuButtons);

      this.menuCurrent = menu;

      menu.show(this.app.element);
    }
  }

  setMenubarButtons(buttons: MenuItem[][]) {
    this.menuButtons = buttons;
  }

  setMenubarText(text: string) {
    this.left.innerText = text;
  }
}
