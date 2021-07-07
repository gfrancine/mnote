// The implementation of the Mnote type in ./types

import { Mnote as Type, MnoteOptions, Module } from "./common/types";

import {
  CtxmenuModule,
  EditorsModule,
  ExtensionsModule,
  FSModule,
  LayoutModule,
  LoggingModule,
  MenubarModule,
  SystemModule,
} from "./modules";

import { PlaintextExtension } from "./extensions/plaintextEditor";
import { el } from "./common/elbuilder";
import { FiletreeModule } from "./modules/filetree";
import { Modal } from "./components/modal";
import { ModalButton } from "./modules/types";
import { getPathParent } from "./common/util/path";
import { strings } from "./common/strings";

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
    // setup the interop modules
    const fs = new FSModule(this.options.fs);
    const system = new SystemModule(this.options.system);

    // initialize with the startpath option
    const startPath = this.options.startPath;
    let startFile: string | undefined;

    if (startPath) {
      if (await fs.isDir(startPath)) {
        this.directory = startPath;
      } else if (await fs.isFile(startPath)) {
        startFile = startPath;
        const dir = getPathParent(startPath);
        this.directory = dir;
      } else {
        this.directory = await fs.getCurrentDir();
        const button: ModalButton = {
          text: "OK",
          command: "",
          kind: "emphasis",
        };
        new Modal({
          container: this.element,
          message: strings.noStartPath(startPath),
          buttons: [button],
        }).prompt();
      }
    } else {
      this.directory = await fs.getCurrentDir();
    }

    // initialize the watcher

    fs.watchInit(this.directory);

    // register the modules
    this
      .addModule("logging", new LoggingModule(this))
      .addModule("fs", fs)
      .addModule("system", system)
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("layout", new LayoutModule(this))
      .addModule("ctxmenu", new CtxmenuModule(this))
      .addModule("filetree", new FiletreeModule(this, startFile))
      .addModule("menubar", new MenubarModule(this))
      .addModule("editors", new EditorsModule(this));

    // register the extensions
    (this.modules.extensions as ExtensionsModule)
      .add(new PlaintextExtension(this));
  }

  addModule(name: string, module: Module): Mnote {
    this.modules[name] = module;
    return this;
  }
}
