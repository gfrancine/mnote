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
import { Modal } from "./components/modal";
import { ModalButton } from "./modules/types";
import { getPathParent } from "./common/util/path";

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
    // initialize with the startpath option

    const fs = new FSModule(this, this.options.fs);
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
          message:
            `Oops - we couldn't find the path "${startPath}". Try relaunching the app.`,
          buttons: [button],
        }).prompt();
      }
    } else {
      this.directory = await fs.getCurrentDir();
    }

    // register the modules

    this
      .addModule("logging", new LoggingModule(this))
      .addModule("fs", fs)
      .addModule("extensions", new ExtensionsModule(this))
      .addModule("keyboard", new InputModule(this))
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
