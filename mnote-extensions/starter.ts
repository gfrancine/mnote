import {
  Mnote,
  EditorsModule,
  EditorContext,
  EditorProvider,
  Extension,
  FSModule,
  Editor,
} from "mnote-core"
import { el } from "mnote-util/elbuilder";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  contents: string = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
  }

  cleanup() {
    this.container.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.contents);
  }
}

// provider

class PlaintextEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(_path: string) {
    return new PlaintextEditor(this.app);
  }
  createNewEditor() {
    return new PlaintextEditor(this.app);
  }
}

// extension

export class PlaintextExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "plaintext",
      provider: new PlaintextEditorProvider(this.app),
    });
  }

  cleanup() {}
}
