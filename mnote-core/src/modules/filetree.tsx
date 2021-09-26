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
import FileTree from "./filetree-component";
import { PromptsModule } from "./prompts";
import { MenubarModule } from "./menubar";
import { SystemModule } from "./system";
import { EditorsModule } from "./editors";
import { FileIconsModule } from "./fileicons";
import { FileSearchModule, StringsModule } from ".";

export class FiletreeModule {
  private app: Mnote;
  private element: HTMLElement;
  private nothingHere: HTMLElement;

  private fs: FSModule;
  private layout: LayoutModule;
  private ctxmenu: CtxmenuModule;
  private log: LogModule;
  private menubar: MenubarModule;
  private prompts: PromptsModule;
  private system: SystemModule;
  private editors: EditorsModule;
  private fileicons: FileIconsModule;
  private strings: StringsModule;
  private filesearch: FileSearchModule;

  private selectedFile?: string;
  private directory?: string;
  private tree?: FileTreeNodeWithChildren;
  private searchTerm?: string;

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs;
    this.system = app.modules.system;
    this.layout = app.modules.layout;
    this.ctxmenu = app.modules.ctxmenu;
    this.log = app.modules.log;
    this.prompts = app.modules.prompts;
    this.menubar = app.modules.menubar;
    this.editors = app.modules.editors;
    this.fileicons = app.modules.fileicons;
    this.strings = app.modules.strings;
    this.filesearch = app.modules.filesearch;

    this.nothingHere = el("div")
      .inner(this.strings.get("fileTreePlaceholder"))
      .class("placeholder-nothing")
      .element;

    this.element = el("div")
      .class("filetree-container")
      .children(this.nothingHere)
      .element;

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

    this.fs.onWatchEvent("event", () => {
      this.refreshTree();
    });

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

  getFileTree() {
    return this.tree;
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

  async closeDirectory() {
    this.log.info("filetree: closeDirectory");
    if (!this.directory) {
      this.log.warn(
        "filetree: called closeDirectory when there is no current directory",
      );
      return;
    }

    await this.fs.unwatch(this.directory);
    delete this.directory;
    delete this.tree;
    this.updateTree();
  }

  async setDirectory(path: string) {
    this.log.info("filetree: setDirectory", path);
    if (this.directory) await this.closeDirectory();
    this.directory = path;
    await this.fs.watch(path);
    this.refreshTree();
  }

  private updateTree() {
    this.log.info("filetree: updateTree", this.tree, this.selectedFile);

    const hooks: FileTreeHooks = {
      fileFocused: (path: string) => {
        this.log.info("filetree: file focused", path);
        this.updateEditorSelectedFile(path);
      },
      fileDroppedOnDir: (targetDir: string, droppedFile: string) => {
        const newPath = this.fs.joinPath([
          targetDir,
          this.fs.getPathName(droppedFile),
        ]);
        this.log.info(
          "filetree: file dropped on dir",
          droppedFile,
          targetDir,
          newPath,
        );
        this.fs.renameFile(droppedFile, newPath);
      },
      dirDroppedOnDir: (targetDir: string, droppedDir: string) => {
        const newPath = this.fs.joinPath([
          targetDir,
          this.fs.getPathName(droppedDir),
        ]);
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
          getPathName={(path: string) => this.fs.getPathName(path)}
        />,
        this.element,
      );
    } else {
      unmountComponentAtNode(this.element);
      this.element.appendChild(this.nothingHere);
    }
  }

  //
  //
  //

  private bindToModules() {
    // const cmdOrCtrl = this.system.usesCmd() ? "Cmd" : "Ctrl";

    const sget = this.strings.get;

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
      const maybePath = await this.fs.dialogOpen({
        isDirectory: true,
      });
      if (!maybePath) return;
      this.setDirectory(maybePath);
    };

    const menuReducer = () => {
      const buttons = [];

      buttons.push({
        name: sget("dialogOpenFile"),
        click: openFile,
      });

      buttons.push({
        name: sget("dialogOpenFolder"),
        click: openFolder,
      });

      if (this.directory) {
        buttons.push({
          name: sget("closeFolder"),
          click: () => this.closeDirectory(),
        });

        buttons.push({
          name: sget("refreshFolder"),
          click: () => this.refreshTree(),
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
        case "close-folder":
          return this.closeDirectory();
        case "refresh-folder":
          return this.refreshTree();
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
      name: sget("newFolder"),
      click: async () => {
        const name = await this.prompts.promptTextInput(
          sget("createNewFolder"),
        );
        if (!name) return;
        const path = this.fs.joinPath([dir, name]);
        this.log.info("filetree: New folder", path, "from", [dir, name]);
        await this.fs.createDir(path);
      },
    });

    const makeNewFileButton = (dir: string) => ({
      name: sget("newFile"),
      click: async () => {
        const name = await this.prompts.promptTextInput(
          sget("createNewFolder"),
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
        const filePath = fileTreeItem.getAttribute("data-mn-file-path");
        const disableRename =
          fileTreeItem.getAttribute("data-mn-disable-rename") === "true";

        if (filePath) {
          const buttons = [{
            name: sget("openFile"),
            click: () => {
              this.updateEditorSelectedFile(filePath);
            },
          }, {
            name: sget("deleteFile"),
            click: () => {
              this.fs.removeFile(filePath);
            },
          }];

          if (!disableRename) {
            buttons.push({
              name: sget("renameFile"),
              click: () => {
                const extension = this.fs.getPathExtension(filePath);
                const dotExtension = extension.length > 0
                  ? "." + extension
                  : "";
                const fullFileName = this.fs.getPathName(filePath);
                const fileName = fullFileName.slice(
                  0,
                  dotExtension.length > 0
                    ? -dotExtension.length
                    : fullFileName.length,
                );

                this.prompts.promptTextInput(
                  sget("renameFilePrompt")(fullFileName),
                  fileName,
                )
                  .then((newName) => {
                    if (!newName) return;
                    const newPath = this.fs.joinPath([
                      this.fs.getPathParent(filePath),
                      newName + dotExtension,
                    ]);
                    this.log.info("rename file", filePath, "to", newPath);
                    this.fs.renameFile(filePath, newPath);
                  });
              },
            });
          }

          return buttons;
        } else {
          const dirPath = fileTreeItem.getAttribute("data-mn-dir-path");
          if (dirPath) {
            // a directory
            const buttons = [
              {
                name: sget("deleteFolder"),
                click: () => {
                  this.fs.removeDir(dirPath);
                },
              },
              makeNewFolderButton(dirPath),
              makeNewFileButton(dirPath),
            ];

            if (!disableRename) {
              buttons.push({
                name: sget("renameFolder"),
                click: () => {
                  const dirName = this.fs.getPathName(dirPath);

                  this.prompts.promptTextInput(
                    sget("renameFolderPrompt")(dirName),
                    dirName,
                  )
                    .then((newName) => {
                      if (!newName) return;
                      const newPath = this.fs.joinPath([
                        this.fs.getPathParent(dirPath),
                        newName,
                      ]);
                      this.log.info("rename dir", dirPath, "to", newPath);
                      this.fs.renameDir(dirPath, newPath);
                    });
                },
              });
            }

            return buttons;
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

    const setSearchTerm = (searchTerm?: string) => {
      this.log.info("filetree: set search term", searchTerm);
      this.searchTerm = searchTerm;
      this.updateTree();
    };

    this.filesearch.events.on("search", setSearchTerm);
    this.filesearch.events.on("searchClear", setSearchTerm);
  }
}
