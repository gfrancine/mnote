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
import { LogModule } from "./log";

import { render, unmountComponentAtNode } from "react-dom";
import React from "react";
import FileTree from "../components/filetree";
import { PromptsModule } from "./prompts";
import { MenubarModule } from "./menubar";
import { SystemModule } from "./system";
import { getPathName } from "mnote-util/path";
import { EditorsModule } from "./editors";
import { FileIconsModule } from "./fileicons";
import { searchForPaths } from "mnote-util/nodes";

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
  private log: LogModule;
  private menubar: MenubarModule;
  private prompts: PromptsModule;
  private system: SystemModule;
  private editors: EditorsModule;
  private fileicons: FileIconsModule;

  private selectedFile?: string;
  private directory?: string;
  private tree?: FileTreeNodeWithChildren;
  private searchTerm?: string;

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
    this.log = app.modules.log;
    this.prompts = app.modules.prompts;
    this.menubar = app.modules.menubar;
    this.editors = app.modules.editors;
    this.fileicons = app.modules.fileicons;

    this.bindToModules();
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
      this.log.warn("filetree: refreshed empty directory");
      return;
    }

    const tree = await this.fs.readDir(this.directory);

    if (tree.children) {
      this.setFileTree(tree as FileTreeNodeWithChildren);
    } else {
      this.log.err(
        "filetree: read directory - no children, Dir:",
        this.directory,
      );
    }
  }

  updateEditorSelectedFile(path: string) {
    this.editors.open(path);
  }

  setFileTree(tree: FileTreeNodeWithChildren) {
    this.log.info("filetree: setFileTree", tree);
    this.tree = tree;
    this.updateTree();
  }

  setSelectedFile(path?: string) {
    this.log.info("filetree: setSelectedFile", path);
    this.selectedFile = path;
    this.updateTree();
  }

  setDirectory(path: string) {
    this.log.info("filetree: setDirectory", path);
    //
    // todo: close the existing watcher
    //
    this.directory = path;
    this.fs.watchInit(path);
    this.refreshTree();
  }

  setSearchTerm(searchTerm?: string) {
    this.log.info("filetree: set search term", searchTerm);
    if (searchTerm && searchTerm.length === 0) searchTerm = undefined;
    this.searchTerm = searchTerm;
    this.updateTree();
  }

  private updateTree() {
    this.log.info("filetree: updateTree", this.tree, this.selectedFile);

    const hooks: FileTreeHooks = {
      fileFocused: (path: string) => {
        this.log.info("filetree: file focused", path);
        this.updateEditorSelectedFile(path);
      },
      fileDroppedOnDir: (targetDir: string, droppedFile: string) => {
        const newPath = this.fs.joinPath([targetDir, getPathName(droppedFile)]);
        this.log.info(
          "filetree: file dropped on dir",
          droppedFile,
          targetDir,
          newPath,
        );
        this.fs.renameFile(droppedFile, newPath);
      },
      dirDroppedOnDir: (targetDir: string, droppedDir: string) => {
        const newPath = this.fs.joinPath([targetDir, getPathName(droppedDir)]);
        this.log.info(
          "filetree: dir dropped on dir",
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
          searchTerm={this.searchTerm}
        />,
        this.element,
      );
    } else {
      unmountComponentAtNode(this.element);
      this.element.appendChild(nothingHere);
    }
  }

  //
  //
  //

  private bindToModules() {
    const cmdOrCtrl = this.system.usesCmd() ? "Cmd" : "Ctrl";

    // DRY

    const openFile = async () => {
      const maybePath = await this.fs.dialogOpen({
        isDirectory: false,
        startingDirectory: this.directory,
      });
      if (!maybePath) return;
      this.updateEditorSelectedFile(maybePath);
    };

    const openFolder = async () => {
      if (this.directory) return;
      const maybePath = await this.fs.dialogOpen({
        isDirectory: true,
      });
      if (!maybePath) return;
      this.setDirectory(maybePath);
    };

    const menuReducer = () => {
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

    const findFileTreeItem = (ctx: CtxmenuContext) => {
      for (const el of ctx.elements) {
        if (el.classList.contains("filetree-item")) {
          return el;
        }
      }
    };

    const makeNewFolderButton = (dir: string) => ({
      name: "New folder",
      click: async () => {
        const name = await this.prompts.promptTextInput(
          "Create new folder",
        );
        if (!name) return;
        const path = this.fs.joinPath([dir, name]);
        this.log.info("filetree: New folder", path);
        await this.fs.createDir(path);
      },
    });

    const makeNewFileButton = (dir: string) => ({
      name: "New file",
      click: async () => {
        const name = await this.prompts.promptTextInput(
          "Create new file",
        );
        if (!name) return;
        const path = this.fs.joinPath([dir, name]);
        this.log.info("filetree: New file", path);
        await this.fs.writeTextFile(path, "");
        await this.editors.tryNewTabFromPath(path);
      },
    });

    const ctxmenuReducer = (ctx: CtxmenuContext) => {
      // find a file tree item
      const fileTreeItem = findFileTreeItem(ctx);

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
              makeNewFileButton(dirPath),
            ];
          }
        }
      } else if (ctx.elements.includes(this.element) && this.directory) {
        // right clicked directly on the file tree
        return [
          makeNewFolderButton(this.directory as string),
          makeNewFileButton(this.directory as string),
        ];
      }
    };

    this.menubar.addSectionReducer(menuReducer);
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
  }
}
