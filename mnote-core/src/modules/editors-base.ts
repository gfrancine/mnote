import { Mnote } from "..";
import { DocInfo, EditorInfo, Tab, TabContext, TabInfo } from "./types";
import { LogModule } from "./log";
import { PromptsModule } from "./prompts";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";
import { TabManager } from "./editors-tab";
import { FSModule } from "./fs";

// editors keep the contents in their stae
// this module communicates between all the other parts of the app, so
// no other component can ever access the editor object without going
// here

export class EditorsBaseModule {
  protected element: HTMLElement;
  protected app: Mnote;
  protected log: LogModule;
  protected fs: FSModule;
  private prompts: PromptsModule;

  protected nothingHere: {
    element: HTMLElement;
    show: () => void;
    hide: () => void;
  };

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
    this.fs = app.modules.fs;
    this.log = app.modules.log;
    this.prompts = app.modules.prompts;

    this.nothingHere = (() => {
      const element = el("div")
        .inner(
          "Click the three dots on the top right to open a file or folder.",
        )
        .class("placeholder-nothing")
        .element;

      return {
        element,
        show: () => element.style.display = "flex",
        hide: () => element.style.display = "none",
      };
    })();

    this.element = el("div")
      .class("editor-main")
      .children(this.nothingHere.element)
      .element;

    app.modules.layout.mountToContents(this.element);

    this.app.hooks.on("startup", () => this.startup());
  }

  async startup() {
    // initialize with the startpath option
    const startPath = this.app.options.startPath;
    let startFile: string | undefined;

    if (startPath && await this.fs.isFile(startPath)) {
      startFile = startPath;
    }

    if (startFile) await this.open(startFile);
  }

  registerEditor(opts: EditorInfo) {
    if (this.editorKinds[opts.kind]) {
      throw new Error(`Editor of kind "${opts.kind}" already exists!`);
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
      this.currentTab.manager.hide();
    }

    if (tab) {
      this.nothingHere.hide();
      tab.manager.show();
    } else {
      delete this.currentTab;
      this.nothingHere.show();
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
      this.prompts.notify(`An error occurred while loading: ${e}`);
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
      this.prompts.notify(
        `Cannot open file ${path} because its document type is not supported.`,
      );
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
      name: this.fs.getPathName(path),
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

      await tab.manager.save();
    }
  }

  // create new button
  async newTab(editorKind: string) {
    const editorInfo = this.editorKinds[editorKind];
    if (!editorInfo) {
      throw new Error(`Editor of kind "${editorKind}" does not exist!`);
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
}
