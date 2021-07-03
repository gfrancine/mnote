import { Mnote /* , Module */ } from "../common/types";
import { el } from "../common/elbuilder";
import { LayoutModule } from "./layout";
import { Editor, EditorProvider } from "./types";
import { MenubarModule } from "./menubar";

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
  menubar: MenubarModule;
  // functions that return an editor if it should open a path
  providers: EditorProvider[] = [];
  providerKinds: Record<string, EditorProvider> = {};

  currentEditor?: Editor;

  constructor(app: Mnote) {
    this.app = app;
    this.element = el("div")
      .class("editor-container")
      .element;
    (app.modules.layout as LayoutModule).mountToContents(this.element);
    this.menubar = app.modules.menubar as MenubarModule;
    this.element.appendChild(nothingHere);

    // todo: hook methods to fs events
  }

  registerEditor(kind: string, provider: EditorProvider) {
    if (this.providerKinds[kind]) {
      throw new Error(`Editor of kind "${kind}" already exists!`);
    }
    this.providerKinds[kind] = provider;
    this.providers.push(provider);
  }

  async cleanup() {
    if (this.currentEditor) {
      await this.currentEditor.cleanup();
      delete this.currentEditor;
    }
    this.element.innerHTML = "";
    this.element.appendChild(nothingHere);
  }

  async load(path: string) {
    // todo: check if file exists

    await this.cleanup();

    let selectedEditor: Editor;

    for (let i = this.providers.length - 1; i > -1; i--) {
      const provider = this.providers[i];
      const editor = provider.tryGetEditor(path);
      if (editor) {
        selectedEditor = editor;
        break;
      }
    }

    if (selectedEditor) {
      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";
      await selectedEditor.startup(this.element);
      await selectedEditor.load(path);
    }
  }

  async tryOpen(): Promise<string | void> {
    // use fs.promptOpen
  }

  async trySaveAs() {
    if (!this.currentEditor) return;
    // use fs.promptSave
    // if no path, throw
  }

  async trySave() {
    if (!this.currentEditor) return;

    if (this.currentEditor.hasPath()) {
      this.currentEditor.save();
    } else {
      // prompt save
      await this.trySaveAs();
    }
  }

  async tryClose() {
    if (!this.currentEditor) return;

    if (!this.currentEditor.isSaved()) {
      try {
        await this.trySave();
      } catch {
        await this.cleanup();
        return; // user cancelled save
      }
    } else {
      await this.cleanup();
    }
  }

  async newEditor(kind: string) {
    const provider = this.providerKinds[kind];
    if (!provider) {
      throw new Error(`Editor of kind "${kind}" does not exist!`);
    }

    await this.cleanup();
    this.element.innerHTML = "";

    this.menubar.setMenubarText("* Untitled");

    const editor = provider.createNewEditor();
    this.currentEditor = editor;
    await editor.startup(this.element);
  }
}
