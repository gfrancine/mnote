// The implementation of the Mnote type in ./types

import { Mnote as Type, Module } from "./common/types";

import {
  EditorsModule,
  ExtensionsModule,
  FSModule,
  InputModule,
  LayoutModule,
  MenubarModule,
  SidebarModule,
} from "./modules";

import { PlaintextExtension } from "./extensions/plaintextEditor";

export class Mnote implements Type {
  element: Element;

  modules: Record<string, Module> = {};

  constructor(selector: string /* , options: MnoteOptions */) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element with selector "${selector}"!`);
    }

    this.element = element;

    this
      .addModule("fs", new FSModule(this /* , options.fs */))
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("keyboard", new InputModule(this))
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("layout", new LayoutModule(this))
      .addModule("menubar", new MenubarModule(this))
      .addModule("sidebar", new SidebarModule(this))
      .addModule("editors", new EditorsModule(this));

    (this.modules.extensions as ExtensionsModule)
      .add(new PlaintextExtension(this));
  }

  addModule(name: string, module: Module): Mnote {
    this.modules[name] = module;
    return this;
  }
}
