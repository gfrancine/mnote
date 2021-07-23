import {
  FileTreeHooks,
  FileTreeNodeWithChildren,
  MenuItem,
  Mnote,
} from "../common/types";
import { Emitter } from "mnote-util/emitter";
import { el } from "mnote-util/elbuilder";
import { Context } from "./types";
import { FSModule } from "./fs";
import { LayoutModule } from "./layout";
import { CtxmenuModule } from "./ctxmenu";
import { LoggingModule } from "./logging";

import { render } from "react-dom";
import React from "react";
import FileTree from "../components/filetree";
import { PromptsModule } from "./prompts";
import { MenubarModule } from "./menubar";
import { SystemModule } from "./system";

export class FiletreeModule {
  app: Mnote;
  element: HTMLElement;
  fs: FSModule;
  layout: LayoutModule;
  ctxmenu: CtxmenuModule;
  logging: LoggingModule;
  menubar: MenubarModule;
  prompts: PromptsModule;
  system: SystemModule;

  events: Emitter<{
    fileSelected: (path: string) => void;
  }> = new Emitter();

  selectedFile?: string;
  directory?: string;
  tree?: FileTreeNodeWithChildren;

  constructor(app: Mnote) {
    this.app = app;

    this.element = el("div")
      .class("filetree-container")
      .element;

    this.fs = app.modules.fs as FSModule;
    this.system = app.modules.system as SystemModule;
    this.layout = app.modules.layout as LayoutModule;
    this.ctxmenu = app.modules.ctxmenu as CtxmenuModule;
    this.logging = app.modules.logging as LoggingModule;
    this.prompts = app.modules.prompts as PromptsModule;
    this.menubar = app.modules.menubar as MenubarModule;

    const cmdOrCtrl = this.system.USES_CMD ? "Cmd" : "Ctrl";

    const menubarReducer = () => {
      const buttons = [];

      buttons.push({
        name: "Open File",
        shortcut: cmdOrCtrl + "+O",
        click: async () => {
          const maybePath = await this.fs.dialogOpen({
            directory: false,
          });
          if (!maybePath) return;
          this.setSelectedFile(maybePath);
        },
      });

      if (!this.directory) {
        buttons.push({
          name: "Open Folder",
          shortcut: cmdOrCtrl + "+O",
          click: async () => {
            const maybePath = await this.fs.dialogOpen({
              directory: true,
            });
            if (!maybePath) return;
            this.setDirectory(maybePath);
          },
        });
      }

      return buttons;
    };

    const ctxmenuReducer = (ctx: Context) => {
      // find a file tree item
      let fileTreeItem: Element | undefined;

      for (const el of ctx.elements) {
        if (el.classList.contains("filetree-item")) {
          fileTreeItem = el;
          break;
        }
      }

      if (fileTreeItem) {
        const filePath = fileTreeItem.getAttribute("mn-file-path");
        if (filePath) {
          return [{
            name: "Open file",
            click: () => {
              this.setSelectedFile(filePath);
            },
          }];
        } else {
          // todo: add ability to hook on to new file? hook to file
          // right click? hookTo("fileContextMenu")
          // addFileContextMenuReducer, addDirContextMenuReducer
          const dirPath = fileTreeItem.getAttribute("mn-dir-path");
          if (dirPath) {
            /* section.push({
              name: "New file",
              click: () => {}
            }) */
          }
        }
      }
    };

    this.menubar.addSectionReducer(menubarReducer);
    this.ctxmenu.addSectionReducer(ctxmenuReducer);
    this.layout.mountToFiletree(this.element);

    this.app.hooks.on("startup", async () => await this.startup());
  }

  async startup() {
    // initialize with the startpath option
    const startPath = this.app.options.startPath;
    let startFile: string | undefined;
    let startDirectory: string | undefined;

    if (startPath) {
      if (await this.fs.isDir(startPath)) {
        startDirectory = startPath;
      } else if (await this.fs.isFile(startPath)) {
        startFile = startPath;
      }
    }

    this.fs.onWatchEvent(() => this.refreshTree());

    if (startDirectory) this.setDirectory(startDirectory);
    if (startFile) this.setSelectedFile(startFile);
  }

  async refreshTree() {
    if (!this.directory) {
      this.logging.warn("refreshed empty directory");
      return;
    }

    const tree = await this.fs.readDir(this.directory);

    if (tree.children) {
      this.setFileTree(tree as FileTreeNodeWithChildren);
    } else {
      this.logging.err(
        "filetree read directory - no children, Dir:",
        this.directory,
      );
    }
  }

  setFileTree(tree: FileTreeNodeWithChildren) {
    this.logging.info("setFileTree", tree);
    this.tree = tree;
    this.updateDisplay();
  }

  setSelectedFile(path: string) {
    this.logging.info("setSelectedFile", path);
    this.selectedFile = path;
    this.events.emitSync("fileSelected", path);
    this.updateDisplay();
  }

  setDirectory(path: string) {
    this.logging.info("setDirectory", path);
    //
    // todo: close the existing watcher
    //
    this.directory = path;
    console.log("watch init");
    this.fs.watchInit(path);
    console.log("finished watch init");
    this.refreshTree();
  }

  protected updateDisplay() {
    this.logging.info("filetree updateDisplay", this.tree, this.selectedFile);

    const hooks: FileTreeHooks = {
      fileFocused: (path: string) => {
        this.logging.info("file focused", path);
        this.setSelectedFile(path);
      },
      fileDroppedOnDir: (targetDir: string, droppedFile: string) => {
        this.logging.info("file dropped on dir", droppedFile, targetDir);
        // todo
      },
    };

    render(
      <FileTree
        node={this.tree}
        hooks={hooks}
        initFocusedNode={this.selectedFile}
      />,
      this.element,
    );
  }
}
