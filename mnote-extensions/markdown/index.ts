// todo:
// find a better and maintained editor

import {
  Editor,
  EditorContext,
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
  themeFactory,
} from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";
import { clipboard } from "@milkdown/plugin-clipboard";

import { el } from "mnote-util/elbuilder";
import "./markdown.scss";
import { markdownIcon } from "./icon";
import { WordStats } from "mnote-components/vanilla/word-stats";

class MarkdownEditor implements Editor {
  app: Mnote;
  editorContainer: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  settings: SettingsModule;
  fs: FSModule;
  ctx?: EditorContext;

  wordstats = new WordStats();
  milkdown: MilkdownEditor;
  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.settings = app.modules.settings;

    this.editorContainer = el("div")
      .class("md-container")
      .attr("spellcheck", "false")
      .element;

    this.wordstats.element.classList.add("md-wordstats");

    this.element = el("div")
      .class("md-extension")
      .children(
        this.editorContainer,
        this.wordstats.element,
      )
      .element;

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

    return MilkdownEditor.make()
      .use(themeFactory({}))
      .use(commonmark)
      .use(listener)
      .use(clipboard)
      .use(history)
      .config(config);
  }

  updateFontSize = () =>
    this.settings.getKeyWithDefault(
      "markdown.font-size",
      "1em",
      (v) => typeof v === "string",
    ).then((value) => {
      this.element.style.setProperty("--md-font-size", value);
    });

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.settings.events.on("change", this.updateFontSize);
    await this.updateFontSize();

    this.ctx = ctx;
    this.container = containter;

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      this.contents = contents;
      this.editorContainer.innerHTML = "";
      this.milkdown = this.createMilkdown({ contents });
      this.updateStats();
    }

    this.container.appendChild(this.element);

    await this.milkdown.create();
  }

  protected updateStats = () => this.wordstats.setText(this.contents);

  protected onUpdate() {
    this.ctx?.updateEdited();
    this.updateStats();
  }

  cleanup() {
    this.settings.events.off("change", this.updateFontSize);
    if (this.container) this.container.removeChild(this.element);
    this.element.innerHTML = "";
  }

  async save(path: string) {
    const contents = this.contents;
    await this.fs.writeTextFile(path, contents);
  }
}

// extension

export class MarkdownExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "md";

    app.modules.fileicons.registerIcon({
      kind: "markdown",
      factory: markdownIcon,
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "Markdown",
      canOpenPath: matchesExtension,
      createNewEditor: () => new MarkdownEditor(app),
      registeredIconKind: "markdown",
      saveAsFileTypes: [{
        name: "Markdown",
        extensions: ["md"],
      }],
    });

    app.modules.settings.registerInput("string", {
      key: "md.font-size",
      title: "Markdown font size",
      category: "Markdown",
      description:
        "Base font size of a markdown editor in a CSS unit (e.g. 12px, 1em, etc...)",
    }, {
      default: "1em",
    });
  }

  cleanup(_app: Mnote) {}
}
