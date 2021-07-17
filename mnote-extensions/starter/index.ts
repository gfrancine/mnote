import {
  Editor,
  EditorContext,
  EditorProvider,
  EditorsModule,
  Extension,
  FSModule,
  Mnote,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

class StarterEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("starter-extension")
      .element;
  }

  startup(containter: HTMLElement, _ctx: EditorContext) {
    this.container = containter;
  }

  async load(path: string) {
    const _contents = await this.fs.readTextFile(path);
  }

  cleanup() {
    this.container?.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.contents);
  }
}

// provider

class StarterEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(_path: string) {
    return new StarterEditor(this.app);
  }
  createNewEditor() {
    return new StarterEditor(this.app);
  }
}

// extension

export class StarterExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "Starter",
      provider: new StarterEditorProvider(this.app),
    });
  }

  cleanup() {}
}
