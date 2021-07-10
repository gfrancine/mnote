// todo:
// find a better and maintained editor

import {
  Editor,
  EditorContext,
  EditorProvider,
  EditorsModule,
  Extension,
  FSModule,
  Mnote,
} from "mnote-core";

import * as HyperMD from "hypermd";
import { Editor as CMEditor } from "codemirror";

import { getPathExtension } from "mnote-util/path";
import { el } from "mnote-util/elbuilder";
import "./markdown.scss";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

HyperMD.fromTextArea;

function countWords(text: string): number {
  return text.split(/\s+/g).length;
}

class MarkdownEditor implements Editor {
  app: Mnote;
  editorContainer: HTMLTextAreaElement;
  statsbar: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  hyper: CMEditor;

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);

    this.editorContainer = el("textarea")
      .class("pen")
      .attr("spellcheck", "false")
      .element as HTMLTextAreaElement;

    this.statsbar = el("div")
      .class("statsbar")
      .element;

    this.element = el("div")
      .class("md-extension")
      .children(
        this.editorContainer,
        this.statsbar,
      )
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    this.container.appendChild(this.element);

    const onUpdate = () => {
      ctx.updateEdited();
      this.updateStats();
    };

    this.hyper = HyperMD.fromTextArea(this.editorContainer, {});

    this.hyper.on("change", onUpdate);
  }

  protected updateStats() {
    const wordCount = countWords(this.hyper.getValue());
    this.statsbar.innerHTML = "W " + wordCount;
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
    this.hyper.setValue(contents);
    this.updateStats();
  }

  cleanup() {
    this.container.removeChild(this.element);
    delete this.hyper;
    this.element.innerHTML = "";
  }

  async save(path: string) {
    const contents = this.hyper.getValue();
    await this.fs.writeTextFile(path, contents);
  }
}

// provider

class MarkdownEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(path: string) {
    if (getPathExtension(path) === "md") {
      return new MarkdownEditor(this.app);
    }
  }

  createNewEditor() {
    return new MarkdownEditor(this.app);
  }
}

// extension

export class MarkdownExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "Markdown",
      provider: new MarkdownEditorProvider(this.app),
      saveAsExtensions: ["md"],
    });
  }

  cleanup() {}
}
