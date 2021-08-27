import {
  Editor,
  EditorContext,
  EditorProvider,
  Extension,
  FSModule,
  Mnote,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { getPathExtension } from "mnote-util/path";
import { plaintextIcon } from "./icon";
import "./plaintext.scss";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  fs: FSModule;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;

    this.fs = (app.modules.fs as FSModule);

    this.textarea = el("textarea")
      .class("plaintext-textarea")
      .class("mousetrap") // enable shortcuts
      .attr("spellcheck", "false")
      .on("keydown", (e) => {
        // allow tabs
        if (e.key !== "Tab") return;
        e.preventDefault();
        const self = e.target as HTMLTextAreaElement;
        const start = self.selectionStart;
        self.value = self.value.slice(0, start) +
          "\t" +
          self.value.slice(self.selectionEnd, self.value.length);
        self.selectionStart = start + 1;
      })
      .element as HTMLTextAreaElement;

    this.element = el("div")
      .class("plaintext-editor")
      .children(
        this.textarea,
      )
      .element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.textarea.addEventListener("input", () => {
      this.contents = this.textarea.value;
      ctx.updateEdited();
    });

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      this.textarea.value = contents;
    }

    this.container = containter;
    containter.appendChild(this.element);
  }

  cleanup() {
    if (this.container) {
      this.container.removeChild(this.element);
    }
  }

  async save(path: string) {
    console.log("plaintext: save file", path, this.contents);
    await this.fs.writeTextFile(path, this.contents);
  }
}

// provider

class PlaintextEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(path: string) {
    if (getPathExtension(path) === "txt") {
      return new PlaintextEditor(this.app);
    }
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
    this.app.modules.fileicons.registerIcon({
      kind: "textFile",
      factory: plaintextIcon,
      shouldUse: (path: string) => getPathExtension(path) === "txt",
    });

    this.app.modules.editors.registerEditor({
      kind: "Plaintext",
      provider: new PlaintextEditorProvider(this.app),
      registeredIconKind: "textFile",
    });
  }

  cleanup() {}
}
