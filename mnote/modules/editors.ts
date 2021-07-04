import { Mnote /* , Module */ } from "../common/types";
import { el } from "../common/elbuilder";
import { LayoutModule } from "./layout";
import { DocInfo, Editor, EditorContext, EditorProvider } from "./types";
import { MenubarModule } from "./menubar";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor-api-basics

// todo: a nicer placeholder
const nothingHere = el("div")
  .inner("nothing here...")
  .element;

// editors keep the contents in their stae
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

/*

flows
open: user clicks open > this.open(), get path > this.load(path) > check for editor
      > create editor > statup editor > load editor(path) > end
open: user clicks open > this.open(), no path > end

save: user clicks save > this.save > if file, editor.save(path) > mark doc as saved > end
      > else open dialog
        > get path > editor.save(path) > mark doc as saved > update doc name > end
        > no path > end

close: user clicks close
   > doc is untitled? > save flow
   > doc is unsaved > would you like to save? > if yes, save flow end > else cancel
   > doc is saved > editor.save(path)
  > this.cleanup() > cleanup editor

*/

export class EditorsModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;
  menubar: MenubarModule;
  fs: FSModule;
  logging: LoggingModule;
  // functions that return an editor if it should open a path
  providers: EditorProvider[] = [];
  providerKinds: Record<string, EditorProvider> = {};

  currentEditor?: Editor;
  currentDocument?: DocInfo;

  constructor(app: Mnote) {
    this.app = app;
    this.menubar = app.modules.menubar as MenubarModule;
    this.fs = app.modules.fs as FSModule;
    this.logging = app.modules.logging as LoggingModule;

    this.element = el("div")
      .class("editor-container")
      .element;
    (app.modules.layout as LayoutModule).mountToContents(this.element);

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

  // open button
  async open(): Promise<string | void> {
    // use fs.dialogOpen
    const path = await this.fs.dialogOpen({
      directory: false,
      multiple: false,
    });

    if (!path) return;

    await this.load(path);
  }

  // prompt a save dialog
  // returns a success boolean (whether the user cancelled)
  async saveAs(): Promise<boolean> {
    if (!this.currentEditor || !this.currentDocument) return true;

    const newPath = await this.fs.dialogSave({});
    if (!newPath) return false;

    this.currentDocument.path = newPath;
    this.currentDocument.name = ""; // todo: path name
    await this.currentEditor.save(this.currentDocument.path);
    return true;
  }

  // directly save the current document, or prompt if it doesn't have a path
  // returns a success boolean (whether the user cancelled)
  async save(): Promise<boolean> {
    if (!this.currentEditor || !this.currentDocument) return true;

    if (this.currentDocument.path) {
      await this.currentEditor.save(this.currentDocument.path);
    } else {
      // prompt save
      const success = await this.saveAs();
      if (!success) {
        return false;
      }
    }

    this.currentDocument.saved = true;
    return true;
  }

  // close button
  async close() {
    if (!this.currentEditor || !this.currentDocument) return;

    if (!this.currentDocument.path) {
      // no path, therefore unsaved
      // popup save as
      // if cancelled, abort
      if (await this.save()) {
        await this.cleanup();
      } else {
        return;
      }
    } else if (!this.currentDocument.saved) {
      // has path, but unsaved
      // would you like to save?
      // save

      // todo: replace this with modal
      if (await this.save()) {
        await this.cleanup();
      } else {
        // user cancelled save
        // abort close
        return;
      }
    } else {
      // has path, saved
      await this.cleanup();
    }
  }

  // create new button
  async newEditor(kind: string) {
    const provider = this.providerKinds[kind];
    if (!provider) {
      throw new Error(`Editor of kind "${kind}" does not exist!`);
    }

    await this.cleanup();
    this.element.innerHTML = "";

    this.currentDocument = {
      name: "Untitled",
      // no path
      saved: false,
    };

    const editor = provider.createNewEditor();
    this.currentEditor = editor;
    await editor.startup(this.element, this.makeContext());
  }

  // cleanup the current document, the current editor,
  // and the container element
  protected async cleanup() {
    if (this.currentDocument) {
      delete this.currentDocument;
    }
    if (this.currentEditor) {
      await this.currentEditor.cleanup();
      delete this.currentEditor;
    }
    this.element.innerHTML = "";
    this.element.appendChild(nothingHere);
  }

  // make the api publicly available to
  // editors
  protected makeContext(): EditorContext {
    return {
      updateEdited: () => {
        if (this.currentDocument) this.currentDocument.saved = false;
        this.logging.info("update edited");
      },
    };
  }

  // try and find an editor that will open a path and start it up
  // will always find an editor, defaults to plaintext
  // takes a path, but doesn't read , only passes it to the editor
  protected async load(path: string) {
    // patj guaranteed exists

    await this.cleanup();

    let selectedEditor: Editor;

    // last added runs first, assuming it's more selective
    // as the plaintext (which accepts all) is first
    for (let i = this.providers.length - 1; i > -1; i--) {
      const provider = this.providers[i];
      const editor = provider.tryGetEditor(path);
      if (editor) {
        selectedEditor = editor;
        break;
      }
    }

    if (selectedEditor) {
      this.currentDocument = {
        name: "", //todo: get path name
        saved: true,
        path,
      };

      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";
      await selectedEditor.startup(this.element, this.makeContext()); //todo: handle err
      await selectedEditor.load(this.currentDocument.path);
    }
  }
}
