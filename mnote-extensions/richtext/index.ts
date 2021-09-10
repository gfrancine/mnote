import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { getPathExtension } from "mnote-util/path";
import suneditor from "suneditor";
import SunEditor from "suneditor/src/lib/core";
import plugins from "suneditor/src/plugins";
import "./richtext.scss";

class RichtextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  toolbarElement: HTMLElement;
  editorElement: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  editor: SunEditor;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);

    this.editorElement = el("textarea")
      .class("richtext-editor")
      .element;

    this.toolbarElement = el("div")
      .class("richtext-toolbar")
      .element;

    this.element = el("div")
      .class("richtext-extension")
      .children(
        this.toolbarElement,
        this.editorElement,
      )
      .element;

    this.editor = suneditor.create(this.editorElement, {
      plugins: [
        plugins.image,
        plugins.link,
        plugins.align,
        plugins.list,
        plugins.table,
        plugins.font,
        plugins.fontSize,
        plugins.formatBlock,
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
        ["list", "link", "image", "table"],
        ["codeView"],
      ],
      toolbarContainer: this.toolbarElement,
      resizingBar: false,
    });

    this.editor.onChange = (contents) => {
      this.contents = contents;
    };

    // disable spell check
    // REWRITEME
    (this.element.querySelector(
      ".se-wrapper-inner.se-wrapper-wysiwyg.sun-editor-editable",
    ) as HTMLDivElement | null)
      ?.setAttribute("spellcheck", "false");

    // hacky way to get rid of the notice
    // REWRITEME
    (this.element.querySelector(".se-notice button.close") as
      | HTMLButtonElement
      | null)?.click();
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      this.contents = contents;
    }
    this.editor.setContents(this.contents);
    this.container = containter;
    containter.appendChild(this.element);
  }

  cleanup() {
    if (this.container) {
      this.container.removeChild(this.element);
    }
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, this.contents);
  }
}

// extension

export class RichtextExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      getPathExtension(path) === "html";

    app.modules.editors.registerEditor({
      kind: "Rich Text",
      canOpenPath: matchesExtension,
      createNewEditor: () => new RichtextEditor(app),
      saveAsFileTypes: [{
        name: "HTML Document",
        extensions: ["html"],
      }],
    });
  }

  cleanup(_app: Mnote) {}
}
