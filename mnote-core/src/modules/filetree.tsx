import {
  FileTreeHooks,
  FileTreeNode,
  FileTreeNodeWithChildren,
} from "../common/types";
import { Mnote } from "..";
import { el } from "mnote-util/elbuilder";
import { CtxmenuContext } from "./types";
import { FSModule } from "./fs";
import { LayoutModule } from "./layout";
import { CtxmenuModule } from "./ctxmenu";
import { LoggingModule } from "./logging";

import { render, unmountComponentAtNode } from "react-dom";
import React from "react";
import FileTree from "../components/filetree";
import { PromptsModule } from "./prompts";
import { MenubarModule } from "./menubar";
import { SystemModule } from "./system";
import { getPathName } from "mnote-util/path";
import { EditorsModule } from "./editors";
import { FileIconsModule } from "./fileicons";

const nothingHere = el("div")
  .inner("No opened folder")
  .class("placeholder-nothing")
  .element;

export class FiletreeModule {
  private app: Mnote;
  private element: HTMLElement;
  private fs: FSModule;
  private layout: LayoutModule;
  private ctxmenu: CtxmenuModule;
  private logging: LoggingModule;
  private menubar: MenubarModule;
  private prompts: PromptsModule;
  private system: SystemModule;
  private editors: EditorsModule;
  private fileicons: FileIconsModule;

  private selectedFile?: string;
  private directory?: string;
  private tree?: FileTreeNodeWithChildren;

  constructor(app: Mnote) {
    this.app = app;

    this.element = el("div")
      .class("filetree-container")
      .children(nothingHere)
      .element;

    this.fs = app.modules.fs;
    this.system = app.modules.system;
    this.layout = app.modules.layout;
    this.ctxmenu = app.modules.ctxmenu;
    this.logging = app.modules.logging;
    this.prompts = app.modules.prompts;
    this.menubar = app.modules.menubar;
    this.editors = app.modules.editors;
    this.fileicons = app.modules.fileicons;

    const cmdOrCtrl = this.system.usesCmd() ? "Cmd" : "Ctrl";

    // DRY

    const openFile = async () => {
      const maybePath = await this.fs.dialogOpen({
        directory: false,
        startingPath: this.directory,
      });
      if (!maybePath) return;
      this.updateEditorSelectedFile(maybePath);
    };

    const openFolder = async () => {
      if (this.directory) return;
      const maybePath = await this.fs.dialogOpen({
        directory: true,
      });
      if (!maybePath) return;
      this.setDirectory(maybePath);
    };

    const menubarReducer = () => {
      const buttons = [];

      buttons.push({
        name: "Open File...",
        shortcut: cmdOrCtrl + "+O",
        click: openFile,
      });

      if (!this.directory) {
        buttons.push({
          name: "Open Folder...",
          shortcut: cmdOrCtrl + "+O",
          click: openFolder,
        });
      }

      if (this.directory) {
        buttons.push({
          name: "Refresh Folder",
          click: () => {
            this.refreshTree();
          },
        });
      }

      return buttons;
    };

    this.system.onAppMenuClick((menuId) => {
      switch (menuId) {
        case "open-file":
          return openFile();
        case "open-folder":
          return openFolder();
      }
    });

    const ctxmenuReducer = (ctx: CtxmenuContext) => {
      // find a file tree item
      let fileTreeItem: Element | undefined;

      for (const el of ctx.elements) {
        if (el.classList.contains("filetree-item")) {
          fileTreeItem = el;
          break;
        }
      }

      const makeNewFolderButton = (dir: string) => {
        return {
          name: "New folder",
          click: async () => {
            const name = await this.prompts.promptTextInput(
              "Create new folder",
            );
            if (!name) return;
            const path = this.fs.joinPath([dir, name]);
            console.log("new dir", path);
            // todo
            await this.fs.createDir(path);
          },
        };
      };

      if (fileTreeItem) {
        const filePath = fileTreeItem.getAttribute("mn-file-path");
        if (filePath) {
          return [{
            name: "Open file",
            click: () => {
              this.updateEditorSelectedFile(filePath);
            },
          }, {
            name: "Delete file",
            click: () => {
              this.fs.removeFile(filePath);
            },
          }];
        } else {
          // todo: add ability to hook on to new file? hook to file
          // right click? hookTo("fileContextMenu")
          // addFileContextMenuReducer, addDirContextMenuReducer
          const dirPath = fileTreeItem.getAttribute("mn-dir-path");
          if (dirPath) {
            return [
              {
                name: "Delete folder",
                click: () => {
                  this.fs.removeDir(dirPath);
                },
              },
              makeNewFolderButton(dirPath),
            ];
          }
        }
      } else if (ctx.elements.includes(this.element) && this.directory) {
        // right clicked directly on the file tree
        return [makeNewFolderButton(this.directory as string)];
      }
    };

    this.menubar.addSectionReducer(menubarReducer);
    this.ctxmenu.addSectionReducer(ctxmenuReducer);
    this.layout.mountToFiletree(this.element);

    const onEditorTabChange = () => {
      if (this.editors.currentTab) {
        this.setSelectedFile(this.editors.currentTab.info.document.path);
      } else {
        this.setSelectedFile();
      }
    };

    this.editors.events.on("activeTabsChanged", onEditorTabChange);
    this.editors.events.on("currentTabSet", onEditorTabChange);

    this.app.hooks.on("startup", () => this.startup());
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

    this.fs.onWatchEvent("event", () => this.refreshTree());

    if (startDirectory) this.setDirectory(startDirectory);
    if (startFile) this.updateEditorSelectedFile(startFile);
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

  updateEditorSelectedFile(path: string) {
    this.editors.open(path);
  }

  setFileTree(tree: FileTreeNodeWithChildren) {
    this.logging.info("setFileTree", tree);
    this.tree = tree;
    this.updateDisplay();
  }

  setSelectedFile(path?: string) {
    this.logging.info("setSelectedFile", path);
    this.selectedFile = path;
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

  private updateDisplay() {
    this.logging.info("filetree updateDisplay", this.tree, this.selectedFile);

    const hooks: FileTreeHooks = {
      fileFocused: (path: string) => {
        this.logging.info("file focused", path);
        this.updateEditorSelectedFile(path);
      },
      fileDroppedOnDir: (targetDir: string, droppedFile: string) => {
        const newPath = this.fs.joinPath([targetDir, getPathName(droppedFile)]);
        this.logging.info(
          "file dropped on dir",
          droppedFile,
          targetDir,
          newPath,
        );
        this.fs.renameFile(droppedFile, newPath);
      },
      dirDroppedOnDir: (targetDir: string, droppedDir: string) => {
        const newPath = this.fs.joinPath([targetDir, getPathName(droppedDir)]);
        this.logging.info(
          "dir dropped on dir",
          droppedDir,
          targetDir,
          newPath,
        );
        this.fs.renameDir(droppedDir, newPath);
      },
    };

    const getFileIcon = (
      node: FileTreeNode,
      fillClass: string,
      strokeClass: string,
    ) => {
      const icon = this.fileicons.getIconForPath(node.path);
      return icon?.factory(fillClass, strokeClass);
    };

    if (this.tree) {
      render(
        <FileTree
          node={this.tree}
          hooks={hooks}
          initFocusedNode={this.selectedFile}
          getFileIcon={getFileIcon}
        />,
        this.element,
      );
    } else {
      unmountComponentAtNode(this.element);
      this.element.appendChild(nothingHere);
    }
  }
}
