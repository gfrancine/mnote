import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { shortenSetProperty } from "mnote-util/dom";
import { el } from "mnote-util/elbuilder";
import { isNumber, isString } from "mnote-util/validators";

import { plaintextIcon } from "./icon";
import "./plaintext.scss";

class PlaintextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  fs: FSModule;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;

    this.fs = app.modules.fs as FSModule;

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
      }).element as HTMLTextAreaElement;

    this.element = el("div")
      .class("plaintext-editor")
      .children(this.textarea).element;
  }

  syncWithSettings = async () => {
    const setProperty = shortenSetProperty(this.textarea);

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.font-size", "13px", isString)
      .then((value) => setProperty("--font-size", value));

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.line-height", "1.5", isString)
      .then((value) => setProperty("--line-height", value));

    await this.app.modules.settings
      .getKeyWithDefault("plaintext.tab-size", 4, isNumber)
      .then((value) => setProperty("--tab-size", "" + value));
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
  startup(app: Mnote) {
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
      key: "plaintext.font-size",
      title: "Font size",
      description:
        "Plaintext editor font size in a CSS unit (e.g. 12px, 1em, etc...)",
      default: "13px",
      type: "string",
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.line-height",
      title: "Line height",
      description: "Plaintext editor line height",
      default: "1.5",
      type: "string",
    });

    app.modules.settings.registerInput({
      subcategory: "plaintext",
      key: "plaintext.tab-size",
      title: "Tab size",
      description: "The number of characters a tab is equal to",
      default: 2,
      min: 1,
      type: "number",
    });
  }

  cleanup(_app: Mnote) {}
}
