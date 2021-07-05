// The implementation of the Mnote type in ./types

import { Mnote as Type, MnoteOptions, Module } from "./common/types";

import {
  CtxmenuModule,
  EditorsModule,
  ExtensionsModule,
  FSModule,
  InputModule,
  LayoutModule,
  LoggingModule,
  MenubarModule,
} from "./modules";

import { PlaintextExtension } from "./extensions/plaintextEditor";
import { el } from "./common/elbuilder";
import { FiletreeModule } from "./modules/filetree";

export class Mnote implements Type {
  options: MnoteOptions;

  element: Element;

  directory: string;

  modules: Record<string, Module> = {};

  constructor(selector: string, options: MnoteOptions) {
    this.options = options;

    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element with selector "${selector}"!`);
    }

    this.element = el("div")
      .class("mnote")
      .parent(element)
      .element;
  }

  async startup() {
    const fs = new FSModule(this, this.options.fs);
    if (this.options.startDir && await fs.isDir(this.options.startDir)) {
      this.directory = this.options.startDir;
    } else {
      this.directory = await fs.getCurrentDir();
    }

    this
      .addModule("logging", new LoggingModule(this))
      .addModule("fs", fs)
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("keyboard", new InputModule(this))
      .addModule("layout", new LayoutModule(this))
      .addModule("ctxmenu", new CtxmenuModule(this))
      .addModule("filetree", new FiletreeModule(this))
      .addModule("menubar", new MenubarModule(this))
      .addModule("editors", new EditorsModule(this));

    (this.modules.extensions as ExtensionsModule)
      .add(new PlaintextExtension(this));
  }

  addModule(name: string, module: Module): Mnote {
    this.modules[name] = module;
    return this;
  }
}
