import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";

import suneditor from "suneditor";
import SunEditor from "suneditor/src/lib/core";
import plugins from "suneditor/src/plugins";
import katex from "katex";
import { htmlIcon } from "./icon";
import "./richtext.scss";
import "katex/dist/katex.css";
import { WordStats } from "mnote-components/vanilla/word-stats";
import { shortenSetProperty } from "mnote-util/dom";
import { isNumber } from "mnote-util/validators";

class RichtextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  toolbarContainer: HTMLElement;
  editorContainer: HTMLElement;
  editorElement: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  editor: SunEditor;

  wordstats = new WordStats();
  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;

    this.wordstats.element.classList.add("richtext-wordstats");

    const dummy = el("textarea").style("display", "none").element;

    this.editorContainer = el("div")
      .class("richtext-editor")
      .children(dummy).element;

    this.toolbarContainer = el("div").class("richtext-toolbar").element;

    this.element = el("div")
      .class("richtext-extension")
      .children(
        this.toolbarContainer,
        this.editorContainer,
        this.wordstats.element
      ).element;

    this.editor = suneditor.create(dummy, {
      plugins: [
        plugins.image,
        plugins.link,
        plugins.align,
        plugins.list,
        plugins.table,
        plugins.font,
        plugins.fontSize,
        plugins.formatBlock,
        plugins.math,
      ],
      buttonList: [
        ["undo", "redo"],
        ["font", "fontSize", "formatBlock"],
        [
          "bold",
          "underline",
          "italic",
          "strike",
          "subscript",
          "superscript",
          "removeFormat",
        ],
        ["outdent", "indent", "align"],
        ["list", "link", "image", "table", "math"],
        ["codeView"],
      ],
      katex,
      toolbarContainer: this.toolbarContainer,
      resizingBar: false,
    });

    this.editorElement = this.element.querySelector(
      ".se-wrapper-inner.se-wrapper-wysiwyg.sun-editor-editable"
    ) as HTMLDivElement;

    // might be null if sun editor updates
    this.app.modules.log.info("richtext: editorElement", this.editorElement);

    // disable spell check
    // REWRITEME
    this.editorElement.setAttribute("spellcheck", "false");

    // hacky way to get rid of the notice
    // REWRITEME
    (
      this.element.querySelector(
        ".se-notice button.close"
      ) as HTMLButtonElement | null
    )?.click();
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      this.contents = contents;
    }

    this.app.modules.settings.events.on("change", this.syncWithSettings);

    this.editor.onInput = this.updateWordStats;

    this.editor.onChange = (contents) => {
      this.contents = contents;
      ctx.markUnsaved();
      this.updateWordStats();
    };

    this.editor.setContents(this.contents);

    this.container = containter;
    containter.appendChild(this.element);
  }

  updateWordStats = () => {
    this.wordstats.setText(this.editorElement.innerText);
  };

  syncWithSettings = async () => {
    const setProperty = shortenSetProperty(this.element);

    await this.app.modules.settings
      .getKeyWithDefault("richtext.default-font-size", 14, isNumber)
      .then((value) => setProperty("--default-font-size", value + "px"));
  };

  cleanup() {
    this.app.modules.settings.events.off("change", this.syncWithSettings);
    if (this.container) this.container.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.contents);
  }
}

// extension

export class RichtextExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "html";

    app.modules.fileicons.registerIcon({
      factory: htmlIcon,
      kind: "html",
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "richtext",
      name: "Rich Text",
      canOpenPath: matchesExtension,
      createNewEditor: () => new RichtextEditor(app),
      createNewFileExtension: "html",
      registeredIconKind: "html",
      saveAsFileTypes: [
        {
          name: "HTML Document",
          extensions: ["html"],
        },
      ],
    });

    app.modules.settings.registerSubcategory({
      category: "extensions",
      key: "richtext",
      title: "Rich Text",
      iconFactory: htmlIcon,
    });

    app.modules.settings.registerInput({
      subcategory: "richtext",
      key: "richtext.default-font-size",
      title: "Default font size",
      description: "Default paragraph font size in pixels",
      type: "number",
      default: 14,
      min: 0,
    });
  }

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  cleanup() {}
}
