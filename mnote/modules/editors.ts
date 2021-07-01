import { Mnote /* , Module */ } from "../common/types";
import { el } from "../common/elbuilder";
import { LayoutModule } from "./layout";
import { Editor, GetEditorFunction } from "./types";

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor-api-basics

const nothingHere = el("div")
  .inner("nothing here...")
  .element;

export class EditorsModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;
  // functions that return an editor if it should open a path
  getEditorFunctions: GetEditorFunction[] = [];
  editorKinds: Record<string, GetEditorFunction> = {};

  currentEditor?: Editor;

  constructor(app: Mnote) {
    this.app = app;
    this.element = el("div").element;
    (app.modules.layout as LayoutModule).mountToContents(this.element);
    this.element.appendChild(nothingHere);
  }

  registerEditor(kind: string, fn: GetEditorFunction) {
    if (this.editorKinds[kind]) {
      throw new Error(`Editor of kind "${kind}" already exists!`);
    }
    this.editorKinds[kind] = fn;
    this.getEditorFunctions.push(fn);
  }

  close() {
    if (this.currentEditor) {
      this.currentEditor.cleanup();
      delete this.currentEditor;
    }
    this.element.innerHTML = "";
    this.element.appendChild(nothingHere);
  }

  open(path: string) {
    this.close();

    let selectedEditor: Editor;

    for (let i = this.getEditorFunctions.length - 1; i > -1; i--) {
      const getEditor = this.getEditorFunctions[i];
      const editor = getEditor(path);
      if (editor) {
        selectedEditor = editor;
        break;
      }
    }

    if (selectedEditor) {
      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";
      selectedEditor.startup(path, this.element);
    }
  }

  //todo
  newEditor(kind: string) {
    const getEditor = this.editorKinds[kind];
    if (!getEditor) {
      throw new Error(`Editor of kind "${kind}" does not exist!`);
    }
    this.close();
  }
}
