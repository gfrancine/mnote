import { el } from "mnote-util/elbuilder";
import { Mnote } from "../common/types";
import { createIcon, IconsList } from "../components/icons";
import { LayoutModule } from "./layout";

export class SidemenuModule {
  layout: LayoutModule;
  element: HTMLElement;

  constructor(app: Mnote) {
    this.layout = app.modules.layout as LayoutModule;
    this.element = el("div")
      .class("sidemenu-main")
      .element;

    this.layout.mountToSidebarMenu(this.element);
  }

  createButton(iconName: keyof IconsList): HTMLElement {
    return el("div")
      .class("sidemenu-button")
      .children(
        createIcon(iconName, "stroke", "fill"),
      )
      .element;
  }

  addButton(button: HTMLElement) {
    this.element.appendChild(button);
  }
}
