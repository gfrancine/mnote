import { Mnote } from "..";
import { DocInfo, EditorInfo, Tab, TabContext, TabInfo } from "./types";
import { MenubarModule } from "./menubar";
import { LogModule } from "./log";
import { SidebarModule } from "./sidebar";
import { InputModule } from "./input";
import { PromptsModule } from "./prompts";
import { SystemModule } from "./system";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";
import { getPathName } from "mnote-util/path";
import { strings } from "../common/strings";
import { Menu, MenuItem } from "mnote-components/vanilla/menu";
import { TabManager } from "./editors-tab";
import { createIcon } from "mnote-components/vanilla/icons";
import { FSModule } from "./fs";

// todo: a nicer placeholder
const nothingHere = (() => {
  const element = el("div")
    .inner("Click the three dots on the top right to open a file or folder.")
    .class("placeholder-nothing")
    .element;

  return {
    element,
    show: () => element.style.display = "block",
    hide: () => element.style.display = "none",
  };
})();

// editors keep the contents in their stae
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

export class EditorsModule {
  private element: HTMLElement;
  private app: Mnote;
  private menubar: MenubarModule;
  private system: SystemModule;
  private input: InputModule;
  private log: LogModule;
  private fs: FSModule;
  private sidebar: SidebarModule;
  private prompts: PromptsModule;

  events: Emitter<{
    currentTabSet: (tab?: Tab) => void; // menubar *Untitled text
    activeTabsChanged: () => void;
  }> = new Emitter();

  // collection of editors and their configurations
  // keep both a list and a map, the list for finding a match from
  // last to first registered
  editors: EditorInfo[] = [];
  editorKinds: Record<string, EditorInfo> = {};

  activeTabs: Tab[] = [];
  currentTab?: Tab;

  constructor(app: Mnote) {
    this.app = app;
    this.menubar = app.modules.menubar;
    this.system = app.modules.system;
    this.input = app.modules.input;
    this.fs = app.modules.fs;
    this.log = app.modules.log;
    this.sidebar = app.modules.sidebar;
    this.prompts = app.modules.prompts;

    this.element = el("div")
      .class("editor-main")
      .element;

    app.modules.layout.mountToContents(this.element);

    this.element.appendChild(nothingHere.element);

    // hook methods to the rest of the app
    this.hookToSidebar();
    this.hookToMenubar();
    this.hookToInputs();
    this.hookToSystem();
  }

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

  // assumes the tab has already been mounted
  changeCurrentTab(tab: Tab | undefined) {
    if (this.currentTab) {
      this.currentTab.manager.setVisible(false);
    }

    if (tab) {
      nothingHere.hide();
      tab.manager.setVisible(true);
    } else {
      delete this.currentTab;
      nothingHere.show();
    }

    this.setCurrentTab(tab);
  }

  // this is used to update the existing tab's state
  private setCurrentTab(tab?: Tab) {
    this.currentTab = tab;
    this.events.emit("currentTabSet", tab);
  }

  private addActiveTab(tab: Tab) {
    this.activeTabs.push(tab);
    tab.manager.mount(this.element);
    this.events.emit("activeTabsChanged");
  }

  private removeActiveTab(index: number) {
    const tabs = this.activeTabs.splice(index, 1);
    tabs[0]?.manager.unmount(this.element);
    this.events.emit("activeTabsChanged");
  }

  // DRY
  private setTabDocument = (tabInfo: TabInfo, doc: DocInfo) => {
    tabInfo.document = doc;
    if (this.currentTab && this.currentTab.info === tabInfo) {
      this.setCurrentTab(this.currentTab); // trigger an update
    }
  };

  private makeTabContext(info: TabInfo): TabContext {
    return {
      getTabInfo: () => info,
      setDocument: (doc: DocInfo) => this.setTabDocument(info, doc),
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
      this.log.err("editors: trySetupTab error", info, e);
      return;
    }

    const tab = {
      manager,
      info,
    };

    this.addActiveTab(tab);
    this.changeCurrentTab(tab);

    return tab;
  }

  tryGetTabFromPath(path: string) {
    for (const tab of this.activeTabs) {
      if (tab.info.document.path === path) {
        return tab;
      }
    }
  }

  private async getEditorInfoForPath(path: string) {
    // last added runs first, assuming it's more selective
    // as the plaintext (which accepts all) is first
    for (let i = this.editors.length - 1; i > -1; i--) {
      const info = this.editors[i];
      if (await info.canOpenPath(path)) return info;
    }
  }

  // open button
  // hooked to file tree's selectedfile event
  async open(path: string) {
    const existingTab = this.tryGetTabFromPath(path);
    if (existingTab) {
      this.changeCurrentTab(existingTab);
      return;
    }

    const selectedEditorInfo = await this.getEditorInfoForPath(path);

    // this should not happen because we have a plaintext editor
    // but it's good to have this
    if (!selectedEditorInfo) {
      this.prompts.notify(strings.openErrorUnsupported(path));
      return;
    }

    const document = {
      name: this.fs.getPathName(path),
      saved: true,
      path,
    };

    const info: TabInfo = {
      editor: await selectedEditorInfo.createNewEditor(),
      document,
      editorInfo: selectedEditorInfo,
      container: this.createContainer(),
    };

    await this.trySetupTab(info);
  }

  // guess the editor from the path
  // used by "Create New File" context menu
  async tryNewTabFromPath(path: string) {
    const editorInfo = await this.getEditorInfoForPath(path);
    if (!editorInfo) {
      return;
    }

    const document = {
      name: getPathName(path),
      saved: false,
    };

    const info: TabInfo = {
      editor: await editorInfo.createNewEditor(),
      document,
      editorInfo,
      container: this.createContainer(),
    };

    const tab = await this.trySetupTab(info);
    if (tab) {
      this.setTabDocument(tab.info, {
        ...document,
        path,
      });
    }
  }

  // create new button
  async newTab(editorKind: string) {
    const editorInfo = this.editorKinds[editorKind];
    if (!editorInfo) {
      throw new Error(strings.editorDoesNotExist(editorKind));
    }

    const info: TabInfo = {
      editor: await editorInfo.createNewEditor(),
      document: {
        name: "Untitled",
        // no path
        saved: false,
      },
      editorInfo,
      container: this.createContainer(),
    };

    await this.trySetupTab(info);
  }

  // prompt a save dialog
  // returns a success boolean (whether the user cancelled)
  saveAs(tab: Tab): Promise<boolean> {
    return tab.manager.saveAs();
  }

  // directly save the current document, or prompt if it doesn't have a path
  // returns a success boolean (whether the user cancelled)
  save(tab: Tab): Promise<boolean> {
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

  // shared actions between menubar & app menu
  private actions = {
    save: () => {
      if (this.currentTab) this.save(this.currentTab);
    },
    saveAs: () => {
      if (this.currentTab) this.saveAs(this.currentTab);
    },
    closeEditor: () => {
      if (this.currentTab) this.close(this.currentTab);
    },
  };

  private hookToSidebar() {
    // the "New File" button and menu
    const button = this.sidebar.createSidemenuButton((fillClass, strokeClass) =>
      createIcon("add", fillClass, strokeClass, "Create a new file")
    );

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
        (menuRect) => {
          return buttonRect.left - menuRect.width < 0
            ? {
              point: { x: buttonRect.left, y: buttonRect.top },
              anchor: { top: false, left: true },
            }
            : {
              point: { x: buttonRect.right, y: buttonRect.top },
              anchor: { top: false, left: false },
            };
        },
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

    this.sidebar.addSidemenuButton(button);
  }

  private hookToMenubar() {
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

    const cmdOrCtrl = this.system.usesCmd() ? "Cmd" : "Ctrl";

    // menu reducer
    const menuReducer = () => {
      // use this value only to determine
      // whether to display the buttons
      const tab = this.currentTab;
      if (tab) {
        const buttons = [];
        buttons.push({
          name: "Save",
          shortcut: cmdOrCtrl + "+S",
          click: this.actions.save,
        });

        if (!tab.info.editorInfo.disableSaveAs) {
          buttons.push({
            name: "Save As...",
            shortcut: cmdOrCtrl + "+Shift+S",
            click: this.actions.saveAs,
          });
        }

        buttons.push({
          name: "Close Editor",
          shortcut: cmdOrCtrl + "+W",
          click: this.actions.closeEditor,
        });

        return buttons;
      }
    };

    this.menubar.addSectionReducer(menuReducer);
  }

  private hookToInputs() {
    this.input.registerShortcut(["command+s", "ctrl+s"], (e) => {
      this.log.info("editors: ctrl s");
      if (this.currentTab) {
        e.preventDefault();
        this.save(this.currentTab);
      }
    });

    this.input.registerShortcut(["command+shift+s", "ctrl+shift+s"], (e) => {
      this.log.info("editors: ctrl shift s");
      if (this.currentTab) {
        e.preventDefault();
        this.saveAs(this.currentTab);
      }
    });

    this.input.registerShortcut(["command+w", "ctrl+w"], (e) => {
      this.log.info("editors: ctrl w");
      if (this.currentTab) {
        e.preventDefault();
        this.close(this.currentTab);
      }
    });
  }

  private hookToSystem() {
    this.system.hookToQuit(async (cancel) => {
      for (const tab of this.activeTabs) {
        const willClose = await this.close(tab);
        if (!willClose) cancel();
      }
    });

    this.system.onAppMenuClick((menuId) => {
      switch (menuId) {
        case "close-editor":
          return this.actions.closeEditor();
        case "save":
          return this.actions.save();
        case "save-as":
          return this.actions.saveAs();
      }
    });
  }
}
