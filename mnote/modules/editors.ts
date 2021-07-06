import { Mnote /* , Module */ } from "../common/types";
import { el } from "../common/elbuilder";
import { LayoutModule } from "./layout";
import {
  DocInfo,
  Editor,
  EditorContext,
  EditorProvider,
  ModalButton,
} from "./types";
import { MenubarModule } from "./menubar";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Modal } from "../components/modal";
import { FiletreeModule } from "./filetree";
import { Emitter } from "../common/emitter";

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
  filetree: FiletreeModule;

  events: Emitter<{
    docSavedChanged: (doc: DocInfo) => void;
    docSet: (doc: DocInfo) => void;
  }> = new Emitter();

  confirmCloseModal: Modal;

  // providers return an editor if it should open a path
  providers: EditorProvider[] = [];
  providerKinds: Record<string, EditorProvider> = {};

  currentEditor?: Editor;
  currentDocument?: DocInfo;

  constructor(app: Mnote) {
    this.app = app;
    this.menubar = app.modules.menubar as MenubarModule;
    this.fs = app.modules.fs as FSModule;
    this.logging = app.modules.logging as LoggingModule;
    this.filetree = app.modules.filetree as FiletreeModule;

    this.confirmCloseModal = new Modal({
      container: this.app.element,
      message: "Would you like to save the current document before closing?",
      buttons: confirmCloseModalButtons, // at the bottom of this file to avoid clutter
    });

    this.element = el("div")
      .class("editor-container")
      .element;

    (app.modules.layout as LayoutModule).mountToContents(this.element);

    this.element.appendChild(nothingHere);

    // hook methods to the rest of the app

    if (this.filetree.selectedFile) {
      this.open(this.filetree.selectedFile).then(() => {
        this.logging.info(
          "editors: loaded start file path from filetree",
          this.filetree.selectedFile,
        );
      });
    }

    this.filetree.events.on("selected", (path: string) => {
      this.logging.info("editors: load path", path);
      this.open(path).then(() => {
        this.logging.info("editors: loaded path", path);
      });
    });
  }

  registerEditor(kind: string, provider: EditorProvider) {
    if (this.providerKinds[kind]) {
      throw new Error(`Editor of kind "${kind}" already exists!`);
    }
    this.providerKinds[kind] = provider;
    this.providers.push(provider);
  }

  // wrapper so that we can hook events
  protected setCurrentDocument(doc?: DocInfo) {
    this.currentDocument = doc;
    this.events.emit("docSet", doc);
  }

  // open button
  async open(path: string) {
    // use fs.dialogOpen
    const willClose = await this.close();
    if (!willClose) {
      return;
    }

    if (!path) {
      const maybePath = await this.fs.dialogOpen({
        directory: false,
      });
      if (!maybePath) return;
    }

    await this.load(path);
  }

  // create new button
  async newEditor(kind: string) {
    this.logging.info("new editor");

    const provider = this.providerKinds[kind];
    if (!provider) {
      throw new Error(`Editor of kind "${kind}" does not exist!`);
    }

    const willClose = await this.close();
    this.logging.info("will close?", willClose);
    if (!willClose) {
      return;
    }

    this.clear();

    this.setCurrentDocument({
      name: "Untitled",
      // no path
      saved: false,
    });

    const editor = provider.createNewEditor();
    this.currentEditor = editor;
    await editor.startup(this.element, this.makeContext());
  }

  // prompt a save dialog
  // returns a success boolean (whether the user cancelled)
  async saveAs(): Promise<boolean> {
    this.logging.info("save as");
    if (!this.currentEditor || !this.currentDocument) return true;

    const newPath = await this.fs.dialogSave({});
    this.logging.info("new path", newPath);
    if (!newPath) return false;

    this.currentDocument.path = newPath;
    this.currentDocument.name = ""; // todo: path name
    await this.currentEditor.save(this.currentDocument.path);
    return true;
  }

  // directly save the current document, or prompt if it doesn't have a path
  // returns a success boolean (whether the user cancelled)
  async save(): Promise<boolean> {
    this.logging.info("save");
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
    this.events.emit("docSavedChanged", this.currentDocument);
    return true;
  }

  // close button
  // returns a boolean whether it;s confirmed and anyone pending can
  // continue
  async close(): Promise<boolean> {
    this.logging.info("close", this.currentDocument, this.currentEditor);
    if (!this.currentEditor || !this.currentDocument) return true;
    this.logging.info("close: has editor and document");

    if (!this.currentDocument.path) {
      this.logging.info("close: doc has no path");
      // no path, therefore unsaved
      // popup save as
      // if cancelled, abort
      if (await this.save()) {
        this.logging.info("close: saved");
        await this.cleanup();
        return true;
      } else {
        this.logging.info("close: unsaved");
        return false;
      }
    } else if (!this.currentDocument.saved) {
      this.logging.info("close: doc has path, but not saved");
      // has path, but unsaved
      // would you like to save?

      switch (await this.confirmCloseModal.prompt()) {
        case "save":
          this.logging.info("close modal: save");
          if (await this.save()) {
            await this.cleanup();
            return true;
          } else {
            return false;
          }
        case "cancel":
          this.logging.info("close modal: cancel");
          return false;
        case "dontsave":
          this.logging.info("close modal: donstave");
          await this.cleanup();
          return true;
      }
    } else {
      this.logging.info("close: doc has path, is saved");
      // has path, saved
      await this.cleanup();
      return true;
    }
  }

  // cleanup the current document, the current editor,
  // and the container element, append an empty placeholder
  protected async cleanup() {
    this.logging.info("cleanup");
    if (this.currentDocument) {
      this.setCurrentDocument(undefined);
    }
    if (this.currentEditor) {
      await this.currentEditor.cleanup();
      delete this.currentEditor;
    }
    this.clear();
    this.element.appendChild(nothingHere);
  }

  // force clear element
  protected clear() {
    this.element.innerHTML = "";
  }

  // make the api publicly available to
  // editors
  protected makeContext(): EditorContext {
    return {
      updateEdited: () => {
        if (this.currentDocument) {
          this.currentDocument.saved = false;
          this.events.emit("docSavedChanged", this.currentDocument);
        }
      },
    };
  }

  // try and find an editor that will open a path and start it up
  // will always find an editor, defaults to plaintext
  // takes a path, but doesn't read , only passes it to the editor
  protected async load(path: string) {
    // patj guaranteed exists

    await this.cleanup();
    this.clear();

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
      this.setCurrentDocument({
        name: "", //todo: get path name
        saved: true,
        path,
      });

      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";
      await selectedEditor.startup(this.element, this.makeContext()); //todo: handle err
      await selectedEditor.load(this.currentDocument.path);
    }
  }
}

const confirmCloseModalButtons: ModalButton[] = [
  {
    kind: "normal",
    text: "Cancel",
    command: "cancel",
  },
  {
    kind: "normal",
    text: "Don't save",
    command: "dontsave",
  },
  {
    kind: "emphasis",
    text: "Save",
    command: "save",
  },
];
