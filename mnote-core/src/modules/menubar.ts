import { MenuItem } from "../common/types";
import { Mnote } from "..";
import { LayoutModule } from "./layout";
import { el, Elbuilder } from "mnote-util/elbuilder";
import { Menu } from "../components/menu";
import { LogModule } from "./log";
import { createIcon } from "../components/icons";

// https://quilljs.com/docs/modules/toolbar/

type SectionReducer = () => MenuItem[] | void;

export class MenubarModule /* implements Module */ {
  private layout: LayoutModule;
  private log: LogModule;

  private element: HTMLElement;
  private left: HTMLElement;
  private right: HTMLElement;
  private app: Mnote;

  private menuToggle: HTMLElement;
  private menuReducers: SectionReducer[] = [];
  private menuCurrent?: Menu;

  constructor(app: Mnote) {
    this.app = app;

    this.left = el("div")
      .class("menubar-left")
      .element;

    this.menuToggle = new Elbuilder(
      this.createMenubarButton(
        ((fillClass, strokeClass) =>
          createIcon("kebabMenu", fillClass, strokeClass, "Menu")),
      ),
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
      .element;

    this.element = el("div")
      .class("menubar")
      .children(
        this.left,
        this.right,
      )
      .element;

    this.addMenubarButton(this.menuToggle);

    this.log = app.modules.log;
    this.layout = app.modules.layout;
    this.layout.mountToMenubar(this.element);

    // close the menu when the user clicks somewhere else
    document.addEventListener("mousedown", (e: MouseEvent) => {
      if (!this.menuCurrent) return;
      const mouseoverEls = document.elementsFromPoint(e.pageX, e.pageY);

      if (mouseoverEls.indexOf(this.menuCurrent.element) === -1) {
        this.hideMenu();
      }
    });
  }

  createMenubarButton(
    iconFactory: (fillClass: string, strokeClass: string) => Element,
  ) {
    return el("div")
      .class("menubar-menu-button")
      .children(
        el("div")
          .class("menubar-icon")
          .children(
            iconFactory("fill", "stroke"),
          )
          .element,
      )
      .element;
  }

  addMenubarButton(button: HTMLElement) {
    this.right.prepend(button);
  }

  showMenu() {
    this.log.info("menubar: showMenu");

    this.hideMenu();

    const buttons: MenuItem[][] = [];
    this.menuReducers.forEach((reducer) => {
      const section = reducer();
      if (section) buttons.push(section);
    });

    if (buttons.length === 0) return;

    const menu = new Menu(
      () => ({
        point: {
          x: this.menuToggle.getBoundingClientRect().right,
          y: this.element.getBoundingClientRect().bottom,
        },
        anchor: { top: true, left: false },
      }),
      buttons,
    );

    this.menuCurrent = menu;

    menu.events.on("click", () => {
      this.log.info("menubar: menu event on click");
      this.hideMenu();
    });

    menu.show(this.app.element);
  }

  hideMenu() {
    this.log.info("menubar: hideMenu", this.menuCurrent);

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
