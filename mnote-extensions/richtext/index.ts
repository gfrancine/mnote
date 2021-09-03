import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { getPathExtension } from "mnote-util/path";
import suneditor from "suneditor";
import SunEditor from "suneditor/src/lib/core";
import _plugins from "suneditor/src/plugins";
import "./richtext.scss";

class RichtextEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  editorElement: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  editor: SunEditor;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);

    this.editorElement = el("div")
      .class("richtext-editor")
      .element;

    this.element = el("div")
      .class("richtext-extension")
      .children(this.editorElement)
      .element;

    this.editor = suneditor.create(this.editorElement, {
      plugins: [
        // plugins.image,
        // plugins.link
      ],
      buttonList: [
        ["undo", "redo"],
        [
          "bold",
          "underline",
          "italic",
          "strike",
          "subscript",
          "superscript",
          "removeFormat",
        ],
        // ['link', 'image']
      ],
    });
    this.editor.onChange = (contents) => {
      this.contents = contents;
    };
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
      getPathExtension(path) === "mnrichtext";

    app.modules.editors.registerEditor({
      kind: "Rich Text",
      canOpenPath: matchesExtension,
      createNewEditor: () => new RichtextEditor(app),
      saveAsFileTypes: [{
        name: "Mnote Rich Text Document",
        extensions: ["mnrichtext"],
      }],
    });
  }

  cleanup(_app: Mnote) {}
}
