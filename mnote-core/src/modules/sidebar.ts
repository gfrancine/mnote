import { el } from "mnote-util/elbuilder";
import { Mnote } from "..";
import { createIcon } from "mnote-components/vanilla/icons";
import { LayoutModule } from "./layout";
import { MenubarModule } from "./menubar";
import makeResizable from "mnote-deps/resizable";

export class SidebarModule {
  private layout: LayoutModule;
  private menubar: MenubarModule;
  private element: HTMLElement;
  private handle: HTMLElement;
  private sidemenu: HTMLElement;
  private toggleSidebarButton: HTMLElement;
  private sidebarVisible = true;

  constructor(app: Mnote) {
    this.layout = app.modules.layout;
    this.menubar = app.modules.menubar;

    this.element = this.layout.sidebar;
    this.handle = this.layout.sidebarHandle;

    makeResizable({
      element: this.element,
      handle: this.handle,
      vertical: false,
      cursor: "e-resize",
    });

    this.sidemenu = el("div")
      .class("sidemenu-main")
      .element;

    this.layout.mountToSidebarMenu(this.sidemenu);

    this.toggleSidebarButton = this.menubar.createMenubarButton((
      fillClass,
      strokeClass,
    ) =>
      createIcon("leftSidebar", fillClass, strokeClass, "Toggle the sidebar")
    );
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
      this.handle.classList.remove("hidden");
    } else {
      this.element.classList.add("hidden");
      this.handle.classList.add("hidden");
    }
  }
}
