import {
  FileTreeHooks,
  FileTreeNodeWithChildren,
  MenuItem,
  Mnote,
} from "../common/types";
import { el } from "mnote-util/elbuilder";
import { Context } from "./types";
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

const nothingHere = el("div")
  .inner("No opened folder")
  .class("placeholder-nothing")
  .element;

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
  editors: EditorsModule;

  selectedFile?: string;
  directory?: string;
  tree?: FileTreeNodeWithChildren;

  constructor(app: Mnote) {
    this.app = app;

    this.element = el("div")
      .class("filetree-container")
      .children(nothingHere)
      .element;

    this.fs = app.modules.fs as FSModule;
    this.system = app.modules.system as SystemModule;
    this.layout = app.modules.layout as LayoutModule;
    this.ctxmenu = app.modules.ctxmenu as CtxmenuModule;
    this.logging = app.modules.logging as LoggingModule;
    this.prompts = app.modules.prompts as PromptsModule;
    this.menubar = app.modules.menubar as MenubarModule;
    this.editors = app.modules.editors as EditorsModule;

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
          this.updateEditorSelectedFile(maybePath);
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

    this.fs.onWatchEvent(() => this.refreshTree());

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

  protected updateDisplay() {
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

    if (this.tree) {
      render(
        <FileTree
          node={this.tree}
          hooks={hooks}
          initFocusedNode={this.selectedFile}
        />,
        this.element,
      );
    } else {
      unmountComponentAtNode(this.element);
      this.element.appendChild(nothingHere);
    }
  }
}
