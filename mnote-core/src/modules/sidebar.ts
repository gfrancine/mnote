import { el } from "mnote-util/elbuilder";
import { Mnote } from "../common/types";
import { createIcon } from "../components/icons";
import { LayoutModule } from "./layout";
import { MenubarModule } from "./menubar";
import makeResizable from "mnote-deps/resizable";

export class SidebarModule {
  layout: LayoutModule;
  menubar: MenubarModule;
  element: HTMLElement;
  sidemenu: HTMLElement;
  toggleSidebarButton: HTMLElement;
  sidebarVisible = true;

  constructor(app: Mnote) {
    this.layout = app.modules.layout as LayoutModule;
    this.menubar = app.modules.menubar as MenubarModule;

    this.element = this.layout.sidebar;

    makeResizable({
      element: this.element,
      handle: this.layout.sidebarHandle,
      vertical: false,
      cursor: "col-resize",
    });

    this.sidemenu = el("div")
      .class("sidemenu-main")
      .element;

    this.layout.mountToSidebarMenu(this.sidemenu);

    this.toggleSidebarButton = this.menubar.createMenubarButton((
      fillClass,
      strokeClass,
    ) => createIcon("leftSidebar", fillClass, strokeClass));
    this.toggleSidebarButton.addEventListener(
      "click",
      () => this.setSidebarVisible(!this.sidebarVisible),
    );

    this.menubar.addMenubarButton(this.toggleSidebarButton);

    this.updateSidebarVisible();
  }

  createSidemenuButton(
    iconFactory: (fillClass: string, strokeClass: string) => Element,
  ): HTMLElement {
    return el("div")
      .class("sidemenu-button")
      .children(
        iconFactory("fill", "stroke"),
      )
      .element;
  }

  addSidemenuButton(button: HTMLElement) {
    this.sidemenu.appendChild(button);
  }

  setSidebarVisible(value: boolean) {
    this.sidebarVisible = value;
    this.updateSidebarVisible();
  }

  updateSidebarVisible() {
    if (this.sidebarVisible) {
      this.element.classList.remove("hidden");
    } else {
      this.element.classList.add("hidden");
    }
  }
}
