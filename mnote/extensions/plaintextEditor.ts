import { Mnote } from "../common/types";
import { EditorsModule } from "../modules/editors";
import { EditorProvider, Extension } from "../modules/types";
import { Editor } from "../modules/types";
import { el } from "../common/elbuilder";

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  textarea: HTMLElement;
  container?: HTMLElement;

  constructor(app: Mnote) {
    this.app = app;

    this.textarea = el("textarea")
      .class("plaintext-textarea")
      .element;

    this.element = el("div")
      .class("plaintext-editor")
      .children(
        this.textarea,
      )
      .element;
  }

  startup(containter: HTMLElement) {
    this.container = containter;
    containter.appendChild(this.element);
  }

  load(path: string) {}

  cleanup() {
    this.container.removeChild(this.element);
  }

  save() {}

  saveAs() {}

  undo() {}

  redo() {}

  isSaved() {
    return true;
  }
}

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

export class PlaintextExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor(
      "plaintext",
      new PlaintextEditorProvider(this.app),
    );
  }

  cleanup() {}
}
