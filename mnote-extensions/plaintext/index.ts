import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { shortenSetProperty } from "mnote-util/dom";
import { el } from "mnote-util/elbuilder";
import { isBoolean, isNumber, isString } from "mnote-util/validators";

import { plaintextIcon } from "./icon";
import "./plaintext.scss";

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  cursorStats: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  fs: FSModule;

  contents = "";
  showCursorStats = true;

  constructor(app: Mnote) {
    this.app = app;

    this.fs = app.modules.fs as FSModule;

    this.cursorStats = el("div").class("plaintext-cursorstats").element;

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
        self.value =
          self.value.slice(0, start) +
          "\t" +
          self.value.slice(self.selectionEnd, self.value.length);
        self.selectionStart = start + 1;
        self.selectionEnd = self.selectionStart;
      })
      .on("input", () => this.updateCursorStats())
      .on("focus", () => this.updateCursorStats())
      .on("click", () => this.updateCursorStats())
      .on("keydown", () => this.updateCursorStats())
      .element as HTMLTextAreaElement;

    this.element = el("div")
      .class("plaintext-editor")
      .children(this.textarea, this.cursorStats).element;
  }

  updateCursorStats() {
    if (!this.showCursorStats) return;
    const linesBefore = this.textarea.value
      .slice(0, this.textarea.selectionEnd)
      .split("\n");
    const col = linesBefore[linesBefore.length - 1].length + 1;
    this.cursorStats.innerText = `Ln ${linesBefore.length}, Col ${col}`;
  }

  syncWithSettings = async () => {
    const setProperty = shortenSetProperty(this.textarea);

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.fontSize", "13px", isString)
      .then((value) => setProperty("--font-size", value));

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.lineHeight", "1.5", isString)
      .then((value) => setProperty("--line-height", value));

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.tabSize", 4, isNumber)
      .then((value) => setProperty("--tab-size", "" + value));

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.showCursorStats", true, isBoolean)
      .then((value) => {
        this.showCursorStats = value;
        this.cursorStats.style.display = value ? "unset" : "none";
        this.updateCursorStats();
      });
  };

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.textarea.addEventListener("input", () => {
      this.contents = this.textarea.value;
      ctx.markUnsaved();
    });

    this.app.modules.settings.events.on("change", this.syncWithSettings);
    await this.syncWithSettings();

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      this.textarea.value = contents;
    }

    this.container = containter;
    containter.appendChild(this.element);
  }

  cleanup() {
    this.app.modules.settings.events.off("change", this.syncWithSettings);

    if (this.container) {
      this.container.removeChild(this.element);
    }
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.contents);
  }
}

// extension

export class PlaintextExtension implements Extension {
  private app?: Mnote;

  startup(app: Mnote) {
    this.app = app;

    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "txt";

    app.modules.fileicons.registerIcon({
      kind: "textFile",
      factory: plaintextIcon,
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "plaintext",
      name: "Plain Text",
      canOpenPath: matchesExtension,
      createNewEditor: () => new PlaintextEditor(app),
      registeredIconKind: "textFile",
      createNewFileExtension: "txt",
      saveAsFileTypes: [
        {
          name: "Plain Text",
          extensions: ["txt"],
        },
      ],
    });

    app.modules.settings.registerSubcategory({
      category: "extensions",
      key: "plaintext",
      title: "Plain Text",
      iconFactory: plaintextIcon,
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.fontSize",
      title: "Font size",
      description:
        "Plaintext editor font size in a CSS unit (e.g. 12px, 1em, etc...)",
      default: "13px",
      type: "string",
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.lineHeight",
      title: "Line height",
      description: "Plaintext editor line height",
      default: "1.5",
      type: "string",
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.tabSize",
      title: "Tab size",
      description: "The number of characters a tab is equal to",
      default: 2,
      min: 1,
      type: "number",
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.showCursorStats",
      title: "Show cursor stats",
      description:
        "Show the line and column cursor position at the bottom right",
      default: true,
      type: "boolean",
    });
  }

  cleanup() {
    const app = this.app;
    if (!app) return;

    app.modules.editors.unregisterEditor("plaintext");
    app.modules.fileicons.unregisterIcon("textFile");
    app.modules.settings.unregisterSubcategory("plaintext");
    [
      "plaintext.fontSize",
      "plaintext.lineHeight",
      "plaintext.tabSize",
      "plaintext.showCursorStats",
    ].forEach((key) =>
      app.modules.settings.unregisterInput({ subcategory: "plaintext", key })
    );
  }
}
