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

import { Editor as MilkdownEditor } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";

import { getPathExtension } from "mnote-util/path";
import { el } from "mnote-util/elbuilder";
import "./markdown.scss";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

function countWords(text: string): number {
  return text.split(/\s+/g).length;
}

class MarkdownEditor implements Editor {
  app: Mnote;
  editorContainer: HTMLElement;
  statsbar: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  ctx: EditorContext;

  milkdown: MilkdownEditor;
  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);

    this.editorContainer = el("div")
      .class("md-container")
      .attr("spellcheck", "false")
      .element as HTMLElement;

    this.statsbar = el("div")
      .class("md-statsbar")
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
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);
  }

  protected updateStats() {
    const wordCount = countWords(this.contents);
    this.statsbar.innerHTML = "W " + wordCount;
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);

    const onUpdate = () => {
      this.ctx.updateEdited();
      this.updateStats();
    };

    this.milkdown = new MilkdownEditor({
      root: this.editorContainer,
      defaultValue: contents,
      listener: {
        markdown: [(getMarkdown) => {
          this.contents = getMarkdown();
          onUpdate();
        }],
      },
    })
      .use(commonmark);

    this.milkdown.create();

    this.updateStats();
  }

  cleanup() {
    this.container.removeChild(this.element);
    delete this.milkdown;
    this.element.innerHTML = "";
  }

  async save(path: string) {
    const contents = this.contents;
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
