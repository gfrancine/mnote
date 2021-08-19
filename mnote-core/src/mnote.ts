// The implementation of the Mnote type in ./types

import { Mnote as Type, MnoteOptions } from "./common/types";
import { Emitter } from "mnote-util/emitter";
import { el } from "mnote-util/elbuilder";

import {
  CtxmenuModule,
  EditorsModule,
  ExtensionsModule,
  FileIconsModule,
  FiletreeModule,
  FSModule,
  InputModule,
  LayoutModule,
  LoggingModule,
  MenubarModule,
  OpenFilesModule,
  PromptsModule,
  SettingsModule,
  SidemenuModule,
  SystemModule,
  ThemesModule,
} from "./modules";

import { PlaintextExtension } from "./extensions/plaintextEditor";
import { SettingsExtension } from "./extensions/settingsEditor";

type Modules = {
  logging: LoggingModule;
  fs: FSModule;
  system: SystemModule;
  input: InputModule;
  extensions: ExtensionsModule;
  settings: SettingsModule;
  layout: LayoutModule;
  prompts: PromptsModule;
  ctxmenu: CtxmenuModule;
  sidemenu: SidemenuModule;
  menubar: MenubarModule;
  editors: EditorsModule;
  fileicons: FileIconsModule;
  filetree: FiletreeModule;
  openfiles: OpenFilesModule;
  themes: ThemesModule;
};

export class Mnote implements Type {
  options: MnoteOptions;

  container: Element;

  element: Element;

  modules: Modules = {} as Modules;

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
    this.modules = {
      logging: new LoggingModule(this),
      fs: new FSModule(this.options.fs),
      system: new SystemModule(this.options.system),
      input: new InputModule(this),
      extensions: new ExtensionsModule(this),
      settings: await new SettingsModule(this).init(),
      layout: new LayoutModule(this),
      prompts: new PromptsModule(this),
      ctxmenu: new CtxmenuModule(this),
      sidemenu: new SidemenuModule(this),
      menubar: new MenubarModule(this),
      editors: new EditorsModule(this),
      fileicons: new FileIconsModule(this),
      filetree: new FiletreeModule(this),
      openfiles: new OpenFilesModule(this),
      themes: await new ThemesModule(this).init(),
    };

    // register the extensions
    const extensions = (this.modules.extensions as ExtensionsModule);
    await Promise.all([
      extensions.add(new PlaintextExtension(this)),
      extensions.add(new SettingsExtension(this)),
    ]);
  }

  async startup() {
    await this.hooks.emitAsync("startup");
    this.container.appendChild(this.element);
  }
}
