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

import {
  Configure as MilkdownConfigure,
  defaultValueCtx,
  Editor as MilkdownEditor,
  rootCtx,
} from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
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

function countChars(text: string): number {
  const matches = text.match(/\w/g);
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
  countMode: "words" | "characters" = "words";

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
      .on("click", () => {
        this.countMode = this.countMode === "words" ? "characters" : "words";
        this.updateStats();
      })
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

    console.log("instatiate constructor");
    this.milkdown = this.createMilkdown({ contents: "" });
  }

  createMilkdown(opts: { contents: string }): MilkdownEditor {
    const config: MilkdownConfigure = (ctx) => {
      ctx.set(rootCtx, this.editorContainer);
      ctx.set(defaultValueCtx, opts.contents);
      ctx.set(listenerCtx, {
        markdown: [(getMarkdown) => {
          this.contents = getMarkdown();
          this.onUpdate();
        }],
      });
    };

    return new MilkdownEditor()
      .config(config)
      .use(commonmark)
      .use(listener);
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    console.log("create startup");
    await this.milkdown.create();
  }

  protected updateStats() {
    switch (this.countMode) {
      case "words":
        const wordCount = countWords(this.contents);
        this.statsbar.innerHTML = "W " + wordCount;
        return;
      case "characters":
        const charCount = countChars(this.contents);
        this.statsbar.innerHTML = "C " + charCount;
        return;
    }
  }

  protected onUpdate() {
    this.ctx?.updateEdited();
    this.updateStats();
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
    this.editorContainer.innerHTML = "";
    this.milkdown = this.createMilkdown({ contents });
    await this.milkdown.create();
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
      saveAsFileTypes: [{
        name: "Markdown",
        extensions: ["md"],
      }],
    });

    const fontSize = this.settings.getKey("md.font-size");
    if (typeof fontSize !== "string") {
      this.settings.setKey("md.font-size", "1em");
    }
  }

  cleanup() {}
}
