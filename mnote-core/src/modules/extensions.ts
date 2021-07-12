import { Mnote /* , Module */ } from "../common/types";
import { Extension } from "./types";

// if modules are services, think of
// extensions as the scripts

export class ExtensionsModule /* implements Module */ {
  app: Mnote;
  extensions: Extension[] = [];

  constructor(app: Mnote) {
    this.app = app;
  }

  add(extension: Extension) {
    this.extensions.push(extension);
    extension.startup();
    return this;
  }

  remove(extension: Extension) {
    const index = this.extensions.indexOf(extension);
    if (index === undefined) return;
    delete this.extensions[index];
    extension.cleanup();
    return this;
  }
}