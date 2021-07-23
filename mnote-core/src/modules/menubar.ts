import { MenuItem, Mnote /* , Module */ } from "../common/types";
import { LayoutModule } from "./layout";
import { el } from "mnote-util/elbuilder";
import { Menu } from "../components/menu";
import { LoggingModule } from "./logging";
import { createIcon } from "../components/icons";

// https://quilljs.com/docs/modules/toolbar/

type SectionReducer = () => MenuItem[] | void;

export class MenubarModule /* implements Module */ {
  layout: LayoutModule;
  logging: LoggingModule;

  element: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  app: Mnote;

  menuToggle: HTMLElement;
  menuButtons: MenuItem[][] = [
    [
      {
        name: "hey",
        click: () => {
          this.logging.info("menubar: menu item click");
        },
      },
    ],
  ];
  menuReducers: SectionReducer[] = [];
  menuCurrent?: Menu;

  constructor(app: Mnote) {
    this.app = app;

    this.left = el("div")
      .class("menubar-left")
      .element;

    this.menuToggle = el("div")
      .class("menubar-menu-toggle")
      .children(
        el("div")
          .class("menubar-icon")
          .children(
            createIcon("kebabMenu", "stroke", "fill"),
          )
          .element,
      )
      .on("click", () => {
        if (this.menuCurrent) {
          this.hideMenu();
        } else {
          this.showMenu();
        }
      })
      .element;

    this.right = el("div")
      .class("menubar-right")
      .children(this.menuToggle)
      .element;

    this.element = el("div")
      .class("menubar")
      .children(
        this.left,
        this.right,
      )
      .element;

    this.logging = app.modules.logging as LoggingModule;
    this.layout = app.modules.layout as LayoutModule;
    this.layout.mountToMenubar(this.element);

    // close the menu when the user clicks somewhere else
    document.addEventListener("mousedown", (e: MouseEvent) => {
      this.logging.info("menubar: menu listener for external mousedown");

      if (!this.menuCurrent) return;
      const mouseoverEls = document.elementsFromPoint(e.pageX, e.pageY);

      if (mouseoverEls.indexOf(this.menuCurrent.element) === -1) {
        this.hideMenu();
      }
    });
  }

  showMenu() {
    this.logging.info("menubar: showMenu");

    this.hideMenu();

    const buttons: MenuItem[][] = [];
    this.menuReducers.forEach((reducer) => {
      const section = reducer();
      if (section) buttons.push(section);
    });

    if (buttons.length === 0) return;

    const menu = new Menu({
      x: this.menuToggle.getBoundingClientRect().right,
      y: this.element.getBoundingClientRect().bottom,
    }, () => {
      return { top: true, left: false };
    }, buttons);

    this.menuCurrent = menu;

    menu.events.on("click", () => {
      this.logging.info("menubar: menu event on click");
      this.hideMenu();
    });

    menu.show(this.app.element);
  }

  hideMenu() {
    this.logging.info("menubar: hideMenu", this.menuCurrent);

    if (this.menuCurrent) {
      this.menuCurrent.cleanup();
      delete this.menuCurrent;
    }
  }

  addSectionReducer(reducer: SectionReducer) {
    this.menuReducers.push(reducer);
  }

  setMenubarText(text: string) {
    this.left.innerText = text;
  }
}
