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
    const fs = new FSModule(this, this.options.fs);

    const ifStartFile = async () => {
      if (await fs.isFile(this.options.startFile)) {
        // get the parent dir path
        const dir = getPathParent(this.options.startFile);
        this.directory = dir;
      } else {
        // default to cwd, inform the user
        this.directory = await fs.getCurrentDir();
        const button: ModalButton = {
          text: "OK",
          command: "",
          kind: "emphasis",
        };
        new Modal({
          container: this.element,
          message:
            `Oops - we couldn't find the file "${this.options.startFile}". Try relaunching the app.`,
          buttons: [button],
        }).prompt();
      }
    }

    if (this.options.startDir) {
      // user provided a dir
      // verify that it's a directory
      if (await fs.isDir(this.options.startDir)) {
        // open it
        this.directory = this.options.startDir;
      } else if (this.options.startFile) {
        // can't open dir, but a start file is provided
        await ifStartFile()
      } else {
        // default to cwd and inform the user with a modal
        this.directory = await fs.getCurrentDir();
        const button: ModalButton = {
          text: "OK",
          command: "",
          kind: "emphasis",
        };
        new Modal({
          container: this.element,
          message:
            `Oops - we couldn't find the directory "${this.options.startDir}". Try relaunching the app.`,
          buttons: [button],
        }).prompt();
      }
    } else if (this.options.startFile) {
      // a start file is provided
      await ifStartFile()
    } else {
      // default to cwd
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
