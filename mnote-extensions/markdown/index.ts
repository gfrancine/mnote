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
import _ from "./pen/markdown";
import Pen from "./pen";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

class MarkdownEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  pen: Pen;
  fs: FSModule;

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("markdown-editor")
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    this.container.appendChild(this.element);

    this.pen = new Pen({
      class: "pen",
      editor: this.element,
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

    this.element.setAttribute("spellcheck", "false");

    this.element.addEventListener("input", () => {
      ctx.updateEdited();
    });
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
    this.pen.setContent(micromark(contents));
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
    if (getPathExtension(path) === ".md") {
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
    });
  }

  cleanup() {}
}
