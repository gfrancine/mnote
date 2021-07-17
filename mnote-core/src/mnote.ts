// The implementation of the Mnote type in ./types

import { Mnote as Type, MnoteOptions, Module } from "./common/types";
import { Emitter } from "mnote-util/emitter";

import {
  CtxmenuModule,
  EditorsModule,
  ExtensionsModule,
  FiletreeModule,
  FSModule,
  InputModule,
  LayoutModule,
  LoggingModule,
  MenubarModule,
  SettingsModule,
  SidemenuModule,
  SystemModule,
  ThemesModule,
} from "./modules";

import { PlaintextExtension } from "./extensions/plaintextEditor";
import { SettingsExtension } from "./extensions/settingsEditor";

import { el } from "mnote-util/elbuilder";

export class Mnote implements Type {
  options: MnoteOptions;

  container: Element;

  element: Element;

  modules: Record<string, Module> = {};

  hooks: Emitter<{
    startup: () => Promise<void> | void;
  }> = new Emitter();

  constructor(selector: string, options: MnoteOptions) {
    this.options = options;

    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`No element with selector "${selector}"!`);
    }

    this.container = element;

    this.element = el("div")
      .class("mnote")
      .element;
  }

  async init() {
    // register the modules
    this
      .addModule("logging", new LoggingModule(this))
      .addModule("fs", new FSModule(this.options.fs))
      .addModule("system", new SystemModule(this.options.system))
      .addModule("input", new InputModule(this))
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("settings", await new SettingsModule(this).init())
      .addModule("layout", new LayoutModule(this))
      .addModule("ctxmenu", new CtxmenuModule(this))
      .addModule("sidemenu", new SidemenuModule(this))
      .addModule("filetree", new FiletreeModule(this))
      .addModule("menubar", new MenubarModule(this))
      .addModule("editors", new EditorsModule(this))
      .addModule("themes", await new ThemesModule(this).init());

    // register the extensions
    (this.modules.extensions as ExtensionsModule)
      .add(new PlaintextExtension(this))
      .add(new SettingsExtension(this));
  }

  async startup() {
    await this.hooks.emitAsync("startup");
    this.container.appendChild(this.element);
  }

  addModule(name: string, module: Module): Mnote {
    this.modules[name] = module;
    return this;
  }
}
