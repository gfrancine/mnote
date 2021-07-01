import { Mnote /* , Module */ } from "../common/types";
import { el } from "../common/elbuilder";
import { LayoutModule } from "./layout";
import { Editor, EditorProvider } from "./types";

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor-api-basics

const nothingHere = el("div")
  .inner("nothing here...")
  .element;

// editors keep all the state to themselves
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

export class EditorsModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;
  // functions that return an editor if it should open a path
  providers: EditorProvider[] = [];
  providerKinds: Record<string, EditorProvider> = {};

  currentEditor?: Editor;

  constructor(app: Mnote) {
    this.app = app;
    this.element = el("div").element;
    (app.modules.layout as LayoutModule).mountToContents(this.element);
    this.element.appendChild(nothingHere);
  }

  registerEditor(kind: string, provider: EditorProvider) {
    if (this.providerKinds[kind]) {
      throw new Error(`Editor of kind "${kind}" already exists!`);
    }
    this.providerKinds[kind] = provider;
    this.providers.push(provider);
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

    for (let i = this.providers.length - 1; i > -1; i--) {
      const provider = this.providers[i];
      const editor = provider.tryOpen(path);
      if (editor) {
        selectedEditor = editor;
        break;
      }
    }

    if (selectedEditor) {
      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";
      selectedEditor.startup(this.element);
      selectedEditor.load(path);
    }
  }

  newEditor(kind: string) {
    const provider = this.providerKinds[kind];
    if (!provider) {
      throw new Error(`Editor of kind "${kind}" does not exist!`);
    }
    this.close();
    this.element.innerHTML = "";
    const editor = provider.createNew();
    this.currentEditor = editor;
    editor.startup(this.element);
  }
}
