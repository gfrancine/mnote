// The implementation of the Mnote type in ./types

import { MnoteOptions } from "./common/types";
import { Emitter } from "mnote-util/emitter";
import { el } from "mnote-util/elbuilder";

import {
  AppDirModule,
  CtxmenuModule,
  DataDirModule,
  EditorsModule,
  ExtensionsModule,
  FileIconsModule,
  FileSearchModule,
  FiletreeModule,
  FSModule,
  InputModule,
  LayoutModule,
  LogModule,
  MenubarModule,
  OpenTabsModule,
  PopupsModule,
  SettingsModule,
  SidebarModule,
  SystemModule,
  ThemesModule,
} from "./modules";

type Modules = {
  log: LogModule;
  fs: FSModule;
  system: SystemModule;
  input: InputModule;
  extensions: ExtensionsModule;
  appdir: AppDirModule;
  datadir: DataDirModule;
  settings: SettingsModule;
  layout: LayoutModule;
  popups: PopupsModule;
  ctxmenu: CtxmenuModule;
  menubar: MenubarModule;
  sidebar: SidebarModule;
  editors: EditorsModule;
  fileicons: FileIconsModule;
  filetree: FiletreeModule;
  opentabs: OpenTabsModule;
  themes: ThemesModule;
  filesearch: FileSearchModule;
};

export class Mnote {
  options: MnoteOptions;

  container: Element;

  element: HTMLElement;

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

    this.element = el("div").class("mnote").element;
  }

  async init() {
    // register the modules
    const m = this.modules;

    m.log = new LogModule(this);
    m.fs = new FSModule(this.options.fs);
    m.system = new SystemModule(this.options.system);
    m.input = new InputModule(this);
    m.extensions = new ExtensionsModule(this);
    m.datadir = await new DataDirModule(this).init();
    m.settings = await new SettingsModule(this).init();
    m.layout = new LayoutModule(this);
    m.popups = new PopupsModule(this);
    m.ctxmenu = new CtxmenuModule(this);
    m.menubar = new MenubarModule(this);
    m.appdir = new AppDirModule(this);
    m.sidebar = new SidebarModule(this);
    m.fileicons = new FileIconsModule(this);
    m.editors = new EditorsModule(this);
    m.filesearch = new FileSearchModule(this);
    m.filetree = new FiletreeModule(this);
    m.opentabs = new OpenTabsModule(this);
    m.themes = await new ThemesModule(this).init();
  }

  async startup() {
    await this.hooks.emitAsync("startup");
    this.container.appendChild(this.element);
  }
}
