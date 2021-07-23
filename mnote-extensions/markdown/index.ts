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
  SettingsModule,
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
  const matches = text.match(/\w+/g);
  return matches ? matches.length : 0;
}

class MarkdownEditor implements Editor {
  app: Mnote;
  editorContainer: HTMLElement;
  statsbar: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  settings: SettingsModule;
  fs: FSModule;
  ctx?: EditorContext;

  milkdown: MilkdownEditor;
  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.settings = (app.modules.settings as SettingsModule);

    this.editorContainer = el("div")
      .class("md-container")
      .attr("spellcheck", "false")
      .element;

    this.statsbar = el("div")
      .class("md-statsbar")
      .element;

    this.element = el("div")
      .class("md-extension")
      .hook((e) => {
        e.element.style.setProperty(
          "--md-font-size",
          "" + this.settings.getKey("md.font-size"),
        );
      })
      .children(
        this.editorContainer,
        this.statsbar,
      )
      .element;

    this.milkdown = new MilkdownEditor({
      root: this.editorContainer,
      defaultValue: "",
      listener: {
        markdown: [(getMarkdown) => {
          this.contents = getMarkdown();
          this.onUpdate();
        }],
      },
    })
      .use(commonmark);
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    this.milkdown.create();
  }

  protected updateStats() {
    const wordCount = countWords(this.contents);
    this.statsbar.innerHTML = "W " + wordCount;
  }

  protected onUpdate() {
    this.ctx?.updateEdited();
    this.updateStats();
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);

    this.editorContainer.innerHTML = "";

    this.milkdown = new MilkdownEditor({
      root: this.editorContainer,
      defaultValue: contents,
      listener: {
        markdown: [(getMarkdown) => {
          this.contents = getMarkdown();
          this.onUpdate();
        }],
      },
    })
      .use(commonmark);

    this.milkdown.create();

    this.updateStats();
  }

  cleanup() {
    if (this.container) this.container.removeChild(this.element);
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
  settings: SettingsModule;
  editors: EditorsModule;

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;
    this.editors = app.modules.editors as EditorsModule;
  }

  startup() {
    this.editors.registerEditor({
      kind: "Markdown",
      provider: new MarkdownEditorProvider(this.app),
      saveAsExtensions: ["md"],
    });

    const fontSize = this.settings.getKey("md.font-size");
    if (typeof fontSize !== "string") {
      this.settings.setKey("md.font-size", "1em");
    }
  }

  cleanup() {}
}
