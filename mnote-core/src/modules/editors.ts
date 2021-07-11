import { MenuItem, Mnote /* , Module */ } from "../common/types";
import { el } from "mnote-util/elbuilder";
import { LayoutModule } from "./layout";
import {
  DocInfo,
  Editor,
  EditorContext,
  EditorInfo,
  ModalButton,
} from "./types";
import { MenubarModule } from "./menubar";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Modal } from "../components/modal";
import { FiletreeModule } from "./filetree";
import { Emitter } from "mnote-util/emitter";
import { getPathName } from "mnote-util/path";
import { SystemModule } from "./system";
import { strings } from "../common/strings";
import { Menu } from "../components/menu";
import { SidemenuModule } from "./sidemenu";
import { InputModule } from "./input";

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor-api-basics

// todo: a nicer placeholder
const nothingHere = el("div")
  .inner("...")
  .element;

// editors keep the contents in their stae
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

/* outline ( annotations can be found in the actual code )

export class EditorsModule {
  element: HTMLElement;
  events: Emitter<
  confirmCloseModal: Modal;

  editors: EditorInfo[] = [];
  editorKinds: Record<string, EditorInfo> = {};

  currentEditor?: Editor;
  currentDocument?: DocInfo;

  constructor(app: Mnote)

  notifyError(message: string) {

  protected hookToSidebarMenu() {
  protected hookToMenubar() {
  protected hookToInputs() {
  protected hookToFiletree() {

  registerEditor(kind: string, provider: EditorProvider) {
  protected setCurrentDocument(doc?: DocInfo) {
  async open(path?: string) {
  async newEditor(kind: string) {d)
  async saveAs(): Promise<boolean> {
  async save(): Promise<boolean> {
  async close(): Promise<boolean> {
  protected async cleanup() {
  protected clear() {
  protected makeContext(): EditorContext {
  protected async load(path: string) {
} */

export class EditorsModule /* implements Module */ {
  element: HTMLElement;
  app: Mnote;
  menubar: MenubarModule;
  fs: FSModule;
  system: SystemModule;
  input: InputModule;
  logging: LoggingModule;
  sidemenu: SidemenuModule;
  filetree: FiletreeModule;

  events: Emitter<{
    docSet: (doc: DocInfo) => void; // menubar *Untitled text
  }> = new Emitter();

  confirmCloseModal: Modal;

  // collection of editors, thier providers and their configurations
  // providers return an editor if it should open a path
  // keep both a list and a map, the list for finding a match from
  // last to first registered
  editors: EditorInfo[] = [];
  editorKinds: Record<string, EditorInfo> = {};

  currentEditorKind?: string;
  currentEditor?: Editor;
  currentDocument?: DocInfo;

  constructor(app: Mnote) {
    this.app = app;
    this.menubar = app.modules.menubar as MenubarModule;
    this.fs = app.modules.fs as FSModule;
    this.system = app.modules.system as SystemModule;
    this.input = app.modules.input as InputModule;
    this.logging = app.modules.logging as LoggingModule;
    this.sidemenu = app.modules.sidemenu as SidemenuModule;
    this.filetree = app.modules.filetree as FiletreeModule;

    this.confirmCloseModal = new Modal({
      container: this.app.element,
      message: strings.confirmSaveBeforeClose(),
      buttons: confirmCloseModalButtons, // at the bottom of this file to avoid clutter
    });

    this.element = el("div")
      .class("editor-container")
      .element;

    (app.modules.layout as LayoutModule).mountToContents(this.element);

    this.element.appendChild(nothingHere);

    // hook methods to the rest of the app

    this.hookToSidebarMenu();
    this.hookToMenubar();
    this.hookToInputs();
    this.hookToFiletree();
  }

  notifyError(message: string) {
    new Modal({
      container: this.app.element,
      message: message,
      buttons: [{
        kind: "emphasis",
        text: "OK",
        command: "",
      }],
    }).prompt();
  }

  protected hookToSidebarMenu() {
    // the "New File" button and menu
    const button = this.sidemenu.createButton("add");
    let menu: Menu | undefined;

    const hideMenu = () => {
      if (menu) {
        menu.cleanup();
        menu = undefined;
      }
    };

    const getSections: () => MenuItem[] | undefined = () => {
      const result: MenuItem[] = [];
      for (const i in this.editors) {
        const editorInfo = this.editors[i];
        if (!editorInfo.hideFromNewMenu) {
          result.push({
            name: editorInfo.kind,
            click: () => {
              this.newEditor(editorInfo.kind);
              hideMenu();
            },
          });
        }
      }
      return result.length > 0 && result;
    };

    const showMenu = () => {
      hideMenu();

      const buttonRect = button.getBoundingClientRect();

      menu = new Menu(
        { x: buttonRect.right, y: buttonRect.top },
        () => ({ top: false, left: false }),
        [getSections()],
      );

      menu.show(this.app.element);
    };

    button.addEventListener("click", showMenu);
    document.addEventListener("mousedown", (e) => {
      if (menu) {
        const els = document.elementsFromPoint(e.pageX, e.pageY);
        if (els.indexOf(menu.element) === -1) hideMenu();
      }
    });

    this.sidemenu.addButton(button);
  }

  protected hookToMenubar() {
    // update the menubar title
    const updateMenubarTitle = (doc?: DocInfo) => {
      if (doc) {
        this.menubar.setMenubarText(
          (doc.saved ? "" : "*") + doc.name,
        );
      } else {
        this.menubar.setMenubarText("");
      }
    };

    this.events.on("docSet", updateMenubarTitle);

    const cmdOrCtrl = this.system.USES_CMD ? "Cmd" : "Ctrl";
    this.logging.info("command or ctrl?", cmdOrCtrl);

    // menubar reducer
    const menubarReducer = () => {
      const buttons = [];

      buttons.push({
        name: "Open",
        shortcut: cmdOrCtrl + "+O",
        click: () => {
          this.open();
        },
      });

      if (this.currentDocument) {
        buttons.push({
          name: "Save",
          shortcut: cmdOrCtrl + "+S",
          click: () => {
            this.save();
          },
        });

        buttons.push({
          name: "Save As",
          shortcut: cmdOrCtrl + "+Shift+S",
          click: () => {
            this.saveAs();
          },
        });

        buttons.push({
          name: "Close",
          shortcut: cmdOrCtrl + "+W",
          click: () => {
            this.close();
          },
        });
      }

      return buttons;
    };

    this.menubar.addSectionReducer(menubarReducer);
  }

  protected hookToInputs() {
    // hotkeys
    this.input.registerShortcut(["command+o", "ctrl+o"], (e) => {
      this.logging.info("editor keys: ctrl o");
      e.preventDefault();
      this.open();
    });

    this.input.registerShortcut(["command+s", "ctrl+s"], (e) => {
      this.logging.info("editor keys: ctrl s");
      if (this.currentDocument) {
        e.preventDefault();
        this.save();
      }
    });

    this.input.registerShortcut(["command+shift+s", "ctrl+shift+s"], (e) => {
      this.logging.info("editor keys: ctrl shift s");
      if (this.currentDocument) {
        e.preventDefault();
        this.saveAs();
      }
    });

    this.input.registerShortcut(["command+w", "ctrl+w"], (e) => {
      this.logging.info("editor keys: ctrl w");
      if (this.currentDocument) {
        e.preventDefault();
        this.close();
      }
    });
  }

  protected hookToFiletree() {
    // when filetree selects from startPath
    if (this.filetree.selectedFile) {
      this.open(this.filetree.selectedFile).then(() => {
        this.logging.info(
          "editors: loaded start file path from filetree",
          this.filetree.selectedFile,
        );
      });
    }

    // when a filetree file gets selected
    this.filetree.events.on("selected", (path: string) => {
      this.logging.info("editors: load path", path);
      this.open(path).then(() => {
        this.logging.info("editors: loaded path", path);
      });
    });
  }

  /** Register an editor provider */
  registerEditor(opts: EditorInfo) {
    if (this.editorKinds[opts.kind]) {
      throw new Error(`Editor of kind "${opts.kind}" already exists!`);
    }
    this.editorKinds[opts.kind] = opts;
    this.editors.push(opts);
  }

  // wrapper so that we can hook events
  protected setCurrentDocument(doc?: DocInfo) {
    this.currentDocument = doc;
    this.events.emit("docSet", doc);
  }

  // open button
  async open(path?: string) {
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

    const editorInfo = this.editorKinds[kind];
    if (!editorInfo) {
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

    this.currentEditorKind = editorInfo.kind;
    const editor = editorInfo.provider.createNewEditor();
    this.currentEditor = editor;
    await editor.startup(this.element, this.makeContext());
  }

  // DRY for saving with a modal on error
  protected async trySaveEditor(): Promise<boolean> {
    try {
      await this.currentEditor.save(this.currentDocument.path);
      return true;
    } catch (e) {
      this.notifyError(`An error occurred while saving: ${e}`);
      return false;
    }
  }

  // prompt a save dialog
  // returns a success boolean (whether the user cancelled)
  async saveAs(): Promise<boolean> {
    this.logging.info("save as");
    if (!this.currentEditor || !this.currentDocument) return true;

    const editorInfo = this.editorKinds[this.currentEditorKind];

    const newPath = await this.fs.dialogSave({
      extensions: editorInfo.saveAsExtensions,
    });

    this.logging.info("new path", newPath);
    if (!newPath) return false;

    const newPathName = getPathName(newPath);
    this.setCurrentDocument({
      path: newPath,
      name: newPathName,
      saved: false,
    });

    const success = await this.trySaveEditor();
    this.logging.info("save editor success", success);
    if (!success) return false;

    this.setCurrentDocument({
      path: newPath,
      name: newPathName,
      saved: true,
    });

    return true;
  }

  // directly save the current document, or prompt if it doesn't have a path
  // returns a success boolean (whether the user cancelled)
  async save(): Promise<boolean> {
    this.logging.info("save");
    if (!this.currentEditor || !this.currentDocument) return true;

    if (this.currentDocument.path) {
      const success = await this.trySaveEditor();
      if (!success) {
        return false;
      }
    } else {
      // prompt save
      const success = await this.saveAs();
      if (!success) {
        return false;
      }
    }

    this.setCurrentDocument({
      ...this.currentDocument,
      saved: true,
    });

    return true;
  }

  // close button
  // returns a boolean whether it;s confirmed and anyone pending can
  // continue
  async close(): Promise<boolean> {
    this.logging.info("close", this.currentDocument, this.currentEditor);
    if (!this.currentEditor || !this.currentDocument) return true;
    this.logging.info("close: has editor and document");

    if (!this.currentDocument.saved) {
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
    if (this.currentEditor) {
      await this.currentEditor.cleanup();
      delete this.currentEditor;
    }
    this.clear();
    this.element.appendChild(nothingHere);
    if (this.currentDocument) {
      this.setCurrentDocument(undefined);
    }
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
          this.setCurrentDocument({
            ...this.currentDocument,
            saved: false,
          });
        }
      },
      getDocument: () => this.currentDocument,
      setDocument: (doc: DocInfo) => {
        this.setCurrentDocument(doc);
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
    let selectedEditorKind: string;

    // last added runs first, assuming it's more selective
    // as the plaintext (which accepts all) is first
    for (let i = this.editors.length - 1; i > -1; i--) {
      const kind = this.editors[i].kind;
      const provider = this.editors[i].provider;
      const editor = provider.tryGetEditor(path);
      if (editor) {
        selectedEditor = editor;
        selectedEditorKind = kind;
        break;
      }
    }

    if (selectedEditor) {
      this.setCurrentDocument({
        name: getPathName(path),
        saved: true,
        path,
      });

      this.currentEditorKind = selectedEditorKind;
      this.currentEditor = selectedEditor;
      this.element.innerHTML = "";

      try {
        await selectedEditor.startup(this.element, this.makeContext()); //todo: handle err
        await selectedEditor.load(this.currentDocument.path);
      } catch (e) {
        this.notifyError(`An error occurred while loading: ${e}`);
        await this.cleanup();
      }
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
