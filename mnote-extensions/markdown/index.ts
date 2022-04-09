import {
  Editor,
  EditorContext,
  Extension,
  FSModule,
  InputModule,
  Mnote,
  SettingsModule,
} from "mnote-core";
import {
  defaultValueCtx,
  Editor as MilkdownEditor,
  rootCtx,
  themeFactory,
} from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { gfm } from "@milkdown/preset-gfm";
import { history } from "@milkdown/plugin-history";
import { clipboard } from "@milkdown/plugin-clipboard";
import { tooltip } from "@milkdown/plugin-tooltip";
import { el } from "mnote-util/elbuilder";
import "./markdown.scss";
import "./materialicons.css";
import { markdownIcon } from "./icon";
import { WordStats } from "mnote-components/vanilla/word-stats";
import { makeImageNode } from "./image";
import { isData, isWeb } from "mnote-util/url";
import { isString } from "mnote-util/validators";
import { slots } from "./milkdownicons";
import { shortenSetProperty } from "mnote-util/dom";
import { link } from "./link";

class MarkdownEditor implements Editor {
  app: Mnote;
  editorContainer: HTMLElement;
  element: HTMLElement;
  container?: HTMLElement;
  settings: SettingsModule;
  fs: FSModule;
  input: InputModule;
  ctx?: EditorContext;

  wordstats = new WordStats();
  milkdown: MilkdownEditor;
  prosemirrorElement?: HTMLElement; // the contenteditable element
  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.settings = app.modules.settings;
    this.input = app.modules.input;

    this.editorContainer = el("div")
      .class("md-container")
      .attr("spellcheck", "false").element;

    this.wordstats.element.classList.add("md-wordstats");

    this.element = el("div")
      .class("md-extension")
      .children(this.editorContainer, this.wordstats.element).element;

    this.milkdown = this.createMilkdown({ contents: "" });
  }

  createMilkdown(opts: { contents: string }): MilkdownEditor {
    const resolveImageSrc = (src: string) => {
      if (!this.ctx) return src; // satisfy the type check
      const { path } = this.ctx.getDocument();
      if (!path) return src;
      if (isWeb(src) || isData(src)) return src;
      const dir = this.fs.getPathParent(path);
      return this.fs.convertImageSrc(this.fs.resolvePath(dir, src));
    };

    return MilkdownEditor.make()
      .use(themeFactory(() => ({ slots })))
      .use(gfm)
      .use(makeImageNode(resolveImageSrc)())
      .use(link())
      .use(listener)
      .use(clipboard)
      .use(history)
      .use(tooltip)
      .config((ctx) => {
        ctx.set(rootCtx, this.editorContainer);
        ctx.set(defaultValueCtx, opts.contents);
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          this.contents = markdown;
          this.onUpdate();
        });
      });
  }

  syncWithSettings = async () => {
    const setProperty = shortenSetProperty(this.element);

    await this.settings
      .getKeyWithDefault("markdown.font-size", "1em", isString)
      .then((value) => setProperty("--md-font-size", value));

    await this.settings
      .getKeyWithDefault("markdown.line-height", "1.35", isString)
      .then((value) => setProperty("--md-line-height", value));
  };

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.settings.events.on("change", this.syncWithSettings);
    await this.syncWithSettings();

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

    const prosemirrorElement =
      this.editorContainer.querySelector(".ProseMirror");
    if (prosemirrorElement)
      this.prosemirrorElement = prosemirrorElement as HTMLElement;
  }

  protected updateStats = () => this.wordstats.setText(this.contents);

  protected onUpdate() {
    this.ctx?.markUnsaved();
    this.updateStats();
  }

  cleanup() {
    this.settings.events.off("change", this.syncWithSettings);
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
      kind: "markdown",
      name: "Markdown",
      canOpenPath: matchesExtension,
      createNewEditor: () => new MarkdownEditor(app),
      createNewFileExtension: "md",
      registeredIconKind: "markdown",
      saveAsFileTypes: [
        {
          name: "Markdown",
          extensions: ["md"],
        },
      ],
    });

    app.modules.settings.registerSubcategory({
      category: "extensions",
      key: "markdown",
      title: "Markdown",
      iconFactory: markdownIcon,
    });

    app.modules.settings.registerInput({
      type: "string",
      key: "markdown.font-size",
      title: "Font size",
      subcategory: "markdown",
      description:
        "Base font size of a markdown editor in a CSS unit (e.g. 12px, 1em, etc...)",
      default: "1em",
    });

    app.modules.settings.registerInput({
      type: "string",
      key: "markdown.line-height",
      title: "Line height",
      subcategory: "markdown",
      description: "Paragraph line height of a markdown editor",
      default: "1.5",
    });
  }

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  cleanup() {}
}
