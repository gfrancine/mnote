import { MenuItem, Mnote } from "../common/types";
import { DocInfo, Editor, EditorInfo, TabContext, TabInfo } from "./types";
import { LayoutModule } from "./layout";
import { MenubarModule } from "./menubar";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { FiletreeModule } from "./filetree";
import { SidemenuModule } from "./sidemenu";
import { InputModule } from "./input";
import { PromptsModule } from "./prompts";
import { SystemModule } from "./system";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";
import { getPathName } from "mnote-util/path";
import { strings } from "../common/strings";
import { Menu } from "../components/menu";
import { TabManager } from "./editors-tab";

// todo: a nicer placeholder
const nothingHere = el("div")
  .inner("No opened file... yet.")
  .class("placeholder-nothing")
  .element;

// editors keep the contents in their stae
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

type Tab = {
  info: TabInfo;
  manager: TabManager;
};

export class EditorsModule {
  element: HTMLElement;
  app: Mnote;
  menubar: MenubarModule;
  fs: FSModule;
  system: SystemModule;
  input: InputModule;
  logging: LoggingModule;
  sidemenu: SidemenuModule;
  filetree: FiletreeModule;
  prompts: PromptsModule;

  events: Emitter<{
    currentTabSet: (tab?: Tab) => void; // menubar *Untitled text
  }> = new Emitter();

  // collection of editors, thier providers and their configurations
  // providers return an editor if it should open a path
  // keep both a list and a map, the list for finding a match from
  // last to first registered
  editors: EditorInfo[] = [];
  editorKinds: Record<string, EditorInfo> = {};

  activeTabs: Tab[] = [];
  currentTab?: Tab;

  constructor(app: Mnote) {
    this.app = app;
    this.menubar = app.modules.menubar as MenubarModule;
    this.fs = app.modules.fs as FSModule;
    this.system = app.modules.system as SystemModule;
    this.input = app.modules.input as InputModule;
    this.logging = app.modules.logging as LoggingModule;
    this.sidemenu = app.modules.sidemenu as SidemenuModule;
    this.filetree = app.modules.filetree as FiletreeModule;
    this.prompts = app.modules.prompts as PromptsModule;

    this.element = el("div")
      .class("editor-main")
      .element;

    (app.modules.layout as LayoutModule).mountToContents(this.element);

    this.element.appendChild(nothingHere);

    // hook methods to the rest of the app
    this.hookToSidebarMenu();
    this.hookToMenubar();
    this.hookToInputs();
    this.hookToFiletree();
    this.hookToSystem();
  }

  /** Register an editor provider */
  registerEditor(opts: EditorInfo) {
    if (this.editorKinds[opts.kind]) {
      throw new Error(strings.editorAlreadyExists(opts.kind));
    }
    this.editorKinds[opts.kind] = opts;
    this.editors.push(opts);
  }

  private createContainer() {
    return el("div")
      .class("editor-container")
      .element;
  }

  // todo?:
  // tigger events on setters
  // maybe once we implement a tabbed menu
  protected changeCurrentTab(tab: Tab | undefined) {
    if (this.currentTab) {
      this.element.removeChild(this.currentTab.info.container);
    }

    this.element.innerHTML = ""; // just to make sure

    if (tab) {
      this.element.appendChild(tab.info.container);
    } else {
      delete this.currentTab;
      this.element.appendChild(nothingHere);
    }

    this.setCurrentTab(tab);
  }

  // this is used to update the existing tab's state
  protected setCurrentTab(tab?: Tab) {
    this.currentTab = tab;
    this.events.emit("currentTabSet", tab);
  }

  protected addActiveTab(tab: Tab) {
    this.activeTabs.push(tab);
  }

  protected removeActiveTab(index: number) {
    this.activeTabs.splice(index, 1);
  }

  private makeTabContext(info: TabInfo): TabContext {
    return {
      getTabInfo: () => info,
      setDocument: (doc: DocInfo) => {
        info.document = doc;
        if (this.currentTab && this.currentTab.info === info) {
          this.setCurrentTab(this.currentTab); // trigger an update
        }
      },
    };
  }

  // DRY for cfeating a manager, try starting it up with a prompt on
  // error, and adding to the active tabs
  // used by open() and newTab()
  private async trySetupTab(info: TabInfo) {
    const manager = new TabManager(this.app, this.makeTabContext(info));

    try {
      await manager.startup();
    } catch (e) {
      this.prompts.notify(strings.loadError(e));
      console.error(e);
      return;
    }

    const tab = {
      manager,
      info,
    };

    this.addActiveTab(tab);
    this.changeCurrentTab(tab);
  }

  // open button
  // hooked to file tree's selectedfile event
  async open(path: string) {
    for (const tab of this.activeTabs) {
      if (tab.info.document.path === path) {
        this.changeCurrentTab(tab);
        return;
      }
    }

    let selectedEditor: Editor | undefined;
    let selectedEditorKind: string | undefined;

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

    // this should not happen because we have a plaintext editor
    // but it's good to have this
    if (!selectedEditor || !selectedEditorKind) {
      this.prompts.notify(strings.openErrorUnsupported(path));
      return;
    }

    const document = {
      name: getPathName(path),
      saved: true,
      path,
    };

    const info: TabInfo = {
      editor: selectedEditor,
      document,
      editorKind: selectedEditorKind,
      editorInfo: this.editorKinds[selectedEditorKind],
      container: this.createContainer(),
    };

    await this.trySetupTab(info);
  }

  // create new button
  async newTab(editorKind: string) {
    const editorInfo = this.editorKinds[editorKind];
    if (!editorInfo) {
      throw new Error(strings.editorDoesNotExist(editorKind));
    }

    const editor = editorInfo.provider.createNewEditor();
    const document = {
      name: "Untitled",
      // no path
      saved: false,
    };

    const info: TabInfo = {
      editor,
      document,
      editorKind,
      editorInfo,
      container: this.createContainer(),
    };

    await this.trySetupTab(info);
  }

  // prompt a save dialog
  // returns a success boolean (whether the user cancelled)
  async saveAs(tab: Tab): Promise<boolean> {
    return tab.manager.saveAs();
  }

  // directly save the current document, or prompt if it doesn't have a path
  // returns a success boolean (whether the user cancelled)
  async save(tab: Tab): Promise<boolean> {
    return tab.manager.save();
  }

  // close button
  // returns a boolean whether it;s confirmed and anyone pending can
  // continue
  async close(tab: Tab): Promise<boolean> {
    const managerWillClose = await tab.manager.close();
    if (!managerWillClose) return false;

    if (tab === this.currentTab) {
      const index = this.activeTabs.indexOf(tab); // guaranteed > -1
      const nextTab = this.activeTabs[index - 1] || this.activeTabs[index + 1]; // Tab | undefined
      this.removeActiveTab(index);
      this.changeCurrentTab(nextTab);
    }

    return true;
  }

  //
  // Bind the module to the rest of the app
  //

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

    const getSection: () => MenuItem[] | undefined = () => {
      const result: MenuItem[] = [];
      for (const editorInfo of this.editors) {
        if (!editorInfo.hideFromNewMenu) {
          result.push({
            name: editorInfo.kind,
            click: () => {
              this.newTab(editorInfo.kind);
              hideMenu();
            },
          });
        }
      }

      if (result.length > 0) return result;
    };

    const showMenu = () => {
      hideMenu();

      const buttonRect = button.getBoundingClientRect();

      const section = getSection();
      const sections = section ? [section] : [];

      menu = new Menu(
        { x: buttonRect.right, y: buttonRect.top },
        () => ({ top: false, left: false }),
        sections,
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
    const updateMenubarTitle = (tab?: Tab) => {
      if (tab) {
        this.menubar.setMenubarText(
          (tab.info.document.saved ? "" : "*") + tab.info.document.name,
        );
      } else {
        this.menubar.setMenubarText("");
      }
    };

    this.events.on("currentTabSet", updateMenubarTitle);

    const cmdOrCtrl = this.system.USES_CMD ? "Cmd" : "Ctrl";
    this.logging.info("command or ctrl?", cmdOrCtrl);

    // menubar reducer
    const menubarReducer = () => {
      // use this value only to determine
      // whether to display the buttons
      const tab = this.currentTab;
      if (tab) {
        const editorInfo = this.editorKinds[tab.info.editorKind];

        const buttons = [];
        buttons.push({
          name: "Save",
          shortcut: cmdOrCtrl + "+S",
          click: () => {
            if (this.currentTab) this.save(this.currentTab);
          },
        });

        if (!editorInfo.disableSaveAs) {
          buttons.push({
            name: "Save As",
            shortcut: cmdOrCtrl + "+Shift+S",
            click: () => {
              if (this.currentTab) this.saveAs(this.currentTab);
            },
          });
        }

        buttons.push({
          name: "Close",
          shortcut: cmdOrCtrl + "+W",
          click: () => {
            if (this.currentTab) this.close(this.currentTab);
          },
        });

        return buttons;
      }
    };

    this.menubar.addSectionReducer(menubarReducer);
  }

  protected hookToInputs() {
    this.input.registerShortcut(["command+s", "ctrl+s"], (e) => {
      this.logging.info("editor keys: ctrl s");
      if (this.currentTab) {
        e.preventDefault();
        this.save(this.currentTab);
      }
    });

    this.input.registerShortcut(["command+shift+s", "ctrl+shift+s"], (e) => {
      this.logging.info("editor keys: ctrl shift s");
      if (this.currentTab) {
        e.preventDefault();
        this.saveAs(this.currentTab);
      }
    });

    this.input.registerShortcut(["command+w", "ctrl+w"], (e) => {
      this.logging.info("editor keys: ctrl w");
      if (this.currentTab) {
        e.preventDefault();
        this.close(this.currentTab);
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
    this.filetree.events.on("fileSelected", (path: string) => {
      this.logging.info("editors: load path", path);
      this.open(path).then(() => {
        this.logging.info("editors: loaded path", path);
      });
    });
  }

  protected hookToSystem() {
    this.system.hookToQuit((cancel) => cancel());
    this.system.hookToQuit(async (cancel) => {
      if (this.currentTab) {
        const willClose = await this.close(this.currentTab);
        if (!willClose) cancel();
      }
    });
  }
}
