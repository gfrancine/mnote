import { Mnote } from "..";
import { Tab } from "./types";
import { MenubarModule } from "./menubar";
import { SidebarModule } from "./sidebar";
import { InputModule } from "./input";
import { SystemModule } from "./system";
import { Menu, MenuItem } from "mnote-components/vanilla/menu";
import { createIcon } from "mnote-components/vanilla/icons";
import { AppDirModule } from "./appdir";
import { EditorsBaseModule } from "./editors-base";
import { FileIconsModule } from "./fileicons";

// previously the editors module was over 500 lines long, mostly due to the
// code binding it to the rest of the app. They should be split into another
// file. see editors-base for the core logic

export class EditorsModule extends EditorsBaseModule {
  private menubar: MenubarModule;
  private system: SystemModule;
  private input: InputModule;
  private appdir: AppDirModule;
  private sidebar: SidebarModule;
  private fileicons: FileIconsModule;

  constructor(app: Mnote) {
    super(app);

    this.menubar = app.modules.menubar;
    this.system = app.modules.system;
    this.input = app.modules.input;
    this.appdir = app.modules.appdir;
    this.sidebar = app.modules.sidebar;
    this.fileicons = app.modules.fileicons;

    this.hookToSidebar();
    this.hookToAppdir();
    this.hookToMenubar();
    this.hookToInputs();
    this.hookToSystem();
  }

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

    const getMenuItems: () => MenuItem[] | undefined = () => {
      const result: MenuItem[] = [];
      for (const editorInfo of this.editors) {
        if (!editorInfo.hideFromNewMenu) {
          const icon = editorInfo.registeredIconKind
            ? this.fileicons.getIcons()[editorInfo.registeredIconKind]
            : undefined;
          result.push({
            name: editorInfo.name,
            icon: icon?.factory,
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
        getMenuItems() || [],
        "Create a new file"
      );

      menu.show(this.app.element);
    };

    button.addEventListener("click", () => {
      if (menu) {
        hideMenu();
      } else {
        showMenu();
      }
    });

    document.addEventListener("mousedown", (e) => {
      if (menu) {
        const els = document.elementsFromPoint(e.pageX, e.pageY);
        if (els.indexOf(menu.element) === -1 && els.indexOf(button) === -1)
          hideMenu();
      }
    });

    this.sidebar.addSidemenuButton(button);
  }

  private hookToAppdir() {
    this.appdir.hooks.on("openFileRequested", async () => {
      const maybePath = await this.fs.dialogOpen({
        isDirectory: false,
        startingDirectory: this.appdir.getDirectory(),
      });
      if (!maybePath) return;
      this.open(maybePath);
    });
  }

  private hookToMenubar() {
    // update the menubar title
    const updateMenubarTitle = (tab?: Tab) => {
      if (tab) {
        this.menubar.setMenubarText(
          (tab.info.document.saved ? "" : "*") + tab.info.document.name
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

    this.menubar.addSectionReducer({
      id: "core.editorsModule",
      reducer: menuReducer,
    });
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
