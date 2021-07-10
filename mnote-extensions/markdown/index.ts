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

import { getPathExtension } from "mnote-util/path";
import { el } from "mnote-util/elbuilder";
import "./markdown.scss";

import { micromark } from "micromark";
import Pen from "./pen";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

function wordCount(text: string): number {
  return text.split(/\s+/g).length;
}

class MarkdownEditor implements Editor {
  app: Mnote;
  editor: HTMLElement;
  statsbar: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  pen: Pen;
  fs: FSModule;

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);

    this.editor = el("div")
      .class("pen")
      .element;

    this.statsbar = el("div")
      .class("statsbar")
      .element;

    this.element = el("div")
      .class("md-extension")
      .children(
        this.editor,
        this.statsbar,
      )
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    this.container.appendChild(this.element);

    this.pen = new Pen({
      editor: this.editor,
      debug: true,
      list: [
        "insertimage",
        "blockquote",
        "h2",
        "h3",
        "p",
        "code",
        "insertorderedlist",
        "insertunorderedlist",
        "inserthorizontalrule",
        "indent",
        "outdent",
        "bold",
        "italic",
        "underline",
        "createlink",
      ],
      linksInNewWindow: true,
    });

    this.editor.setAttribute("spellcheck", "false");

    this.editor.addEventListener("input", () => {
      ctx.updateEdited();
      this.updateStats();
    });
  }

  protected updateStats() {
    this.statsbar.innerHTML = "W " + wordCount(this.editor.innerText);
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
    this.pen.setContent(micromark(contents));
    this.updateStats();
  }

  cleanup() {
    this.container.removeChild(this.element);
    this.pen.destroy();
    this.element.innerHTML = "";
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.pen.toMd());
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
