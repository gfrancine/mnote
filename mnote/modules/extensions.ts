import { Mnote /* , Module */ } from "../common/types";
import { Extension } from "./types";

export class ExtensionsModule /* implements Module */ {
  app: Mnote;
  extensions: Extension[];

  constructor(app: Mnote) {
    this.app = app;
  }

  add(extension: Extension) {
    this.extensions.push(extension);
    extension.startup();
  }

  remove(extension: Extension) {
    const index = this.extensions.indexOf(extension);
    if (index === undefined) return;
    delete this.extensions[index];
    extension.cleanup();
  }
}
