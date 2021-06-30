// The implementation of the Mnote type in ./types

import { Mnote as Type, MnoteState, Module } from "./common/types";
import { Emitter } from "./common/emitter";

import { InputModule } from "./modules/input";
import { LayoutModule } from "./modules/layout";
import { ExtensionsModule } from "./modules/extensions";
import { MenubarModule } from "./modules/menubar";
import { DocumentModule } from "./modules/document";
import { SidebarModule } from "./modules/sidebar";

import { el } from "./common/elbuilder";

export class Mnote implements Type {
  element: Element;

  state: MnoteState = {};

  signals = new Emitter<{
    stateChange: () => void;
  }>();

  modules: Record<string, Module> = {};

  constructor(selector: string) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element with selector "${selector}"!`);
    }

    this.element = element;

    this
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("keyboard", new InputModule(this))
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("layout", new LayoutModule(this))
      .addModule("menubar", new MenubarModule(this))
      .addModule("sidebar", new SidebarModule(this))
      .addModule("document", new DocumentModule(this));
  }

  setState(state: MnoteState) {
    this.state = { ...state };
    this.signals.emit("stateChange");
  }

  addModule(name: string, module: Module): Mnote {
    this.modules[name] = module;
    return this;
  }
}
