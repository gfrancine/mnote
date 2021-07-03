import { Mnote } from "../common/types";
import { EditorsModule } from "../modules/editors";
import { EditorProvider, Extension } from "../modules/types";
import { Editor } from "../modules/types";
import { el } from "../common/elbuilder";
import { FSModule } from "../modules/fs";

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  fs: FSModule;

  contents: string = "";
  saved: boolean = true;
  path?: string;

  constructor(app: Mnote) {
    this.app = app;

    this.fs = (app.modules.fs as FSModule);

    this.textarea = el("textarea")
      .class("plaintext-textarea")
      .element as HTMLTextAreaElement;

    this.element = el("div")
      .class("plaintext-editor")
      .children(
        this.textarea,
      )
      .element;

    this.textarea.addEventListener("input", () => {
      this.saved = false;
      this.contents = this.textarea.value;
    });
  }

  startup(containter: HTMLElement) {
    this.container = containter;
    containter.appendChild(this.element);
  }

  async load(path: string) {
    this.path = path;
    const contents = await this.fs.readTextFile(path);
    this.textarea.value = contents;
  }

  cleanup() {
    this.container.removeChild(this.element);
  }

  async save() {
    if (this.path) {
      await this.fs.writeTextFile(this.path, this.contents);
      this.saved = true;
    }
  }

  async saveAs(path: string) {
    this.path = path;
    await this.fs.writeTextFile(path, this.contents);
  }

  isSaved() {
    return this.saved;
  }

  hasPath() {
    return this.path !== undefined;
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
