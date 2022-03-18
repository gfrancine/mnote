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
import { PopupsModule } from "./popups";
import { AppDirModule } from "./appdir";
import { EditorsModule } from "./editors";
import { FileIconsModule } from "./fileicons";
import { FileSearchModule } from "./filesearch";
import { render, unmountComponentAtNode } from "react-dom";
import Select from "mnote-components/react/dropdowns/Select";
import React from "react";
import FileTree from "./filetree-component";

export class FiletreeModule {
  private element: HTMLElement;
  private nothingHere: HTMLElement;

  private fs: FSModule;
  private layout: LayoutModule;
  private ctxmenu: CtxmenuModule;
  private log: LogModule;
  private appdir: AppDirModule;
  private popups: PopupsModule;
  private editors: EditorsModule;
  private fileicons: FileIconsModule;
  private filesearch: FileSearchModule;

  private selectedFile?: string;
  private tree?: FileTreeNodeWithChildren;
  private searchTerm?: string;

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
    this.layout = app.modules.layout;
    this.ctxmenu = app.modules.ctxmenu;
    this.log = app.modules.log;
    this.popups = app.modules.popups;
    this.appdir = app.modules.appdir;
    this.editors = app.modules.editors;
    this.fileicons = app.modules.fileicons;
    this.filesearch = app.modules.filesearch;

    this.nothingHere = el("div")
      .inner("No Opened Folder")
      .class("placeholder-nothing").element;

    this.element = el("div")
      .class("filetree-container")
      .children(this.nothingHere).element;

    this.fs.onWatchEvent("event", () => {
      this.refreshTree();
    });

    this.bindToModules();
  }

  async refreshTree() {
    const dir = this.appdir.getDirectory();

    if (!dir) {
      this.log.warn("filetree: refreshed empty directory");
      return;
    }

    const tree = await this.fs.readDir(dir);

    if (tree.children) {
      this.setFileTree(tree as FileTreeNodeWithChildren);
    } else {
      this.log.err("filetree: read directory - no children, Dir:", dir);
    }
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

  private updateTree() {
    this.log.info("filetree: updateTree", this.tree, this.selectedFile);

    const hooks: FileTreeHooks = {
      fileFocused: (path: string) => {
        this.log.info("filetree: file focused", path);
        this.editors.open(path);
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
          newPath
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
          newPath
        );
        this.fs.renameDir(droppedDir, newPath);
      },
    };

    const getFileIcon = (
      node: FileTreeNode,
      fillClass: string,
      strokeClass: string
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
          ensureSeparatorAtEnd={(path: string) =>
            this.fs.ensureSeparatorAtEnd(path)
          }
        />,
        this.element
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
    this.appdir.events.on("directorySet", () => this.refreshTree());
    this.appdir.events.on("directoryClosed", () => {
      delete this.tree;
      this.updateTree();
    });

    this.appdir.hooks.on("refreshDirectoryRequested", () => this.refreshTree());

    const findFileTreeItem = (ctx: CtxmenuContext) => {
      for (const el of ctx.elements) {
        if (el.classList.contains("filetree-item")) {
          return el;
        }
      }
    };

    const makeShowInExplorerButton = (path: string) => ({
      name: "Show in Explorer",
      click: () => this.fs.showInExplorer(path),
    });

    const makeNewFolderButton = (dir: string) => ({
      name: "New folder",
      click: async () => {
        const name = await this.popups.promptTextInput(
          `Create new folder inside "${this.fs.getPathName(dir)}"`
        );
        if (!name) return;
        const path = this.fs.joinPath([dir, name]);
        this.log.info("filetree: New folder", path, "from", [dir, name]);
        await this.fs.createDir(path);
      },
    });

    const makeNewFileButton = (dir: string) => {
      const options = [
        {
          text: "Select file type...",
          value: "",
        },
        ...this.editors.editors
          .filter((info) => info.createNewFileExtension !== undefined)
          .map((info) => ({
            text: `.${info.createNewFileExtension} (${info.name})`,
            value: "." + info.createNewFileExtension,
          })),
      ];

      return {
        name: "New file",
        click: async () => {
          const { textInputValue: name, selectValue: extension = "" } =
            await this.popups.promptTextInputWithSelect({
              message: `Create new file inside "${this.fs.getPathName(dir)}"`,
              selectOptions: options,
              selectValue: "",
            });

          if (!name) return;

          const path = this.fs.joinPath([
            dir,
            name.endsWith(extension) ? name : name + extension,
          ]);
          this.log.info("filetree: New file", path);
          await this.fs.writeTextFile(path, "");
          await this.editors.tryNewTabFromPath(path);
        },
      };
    };

    const ctxmenuReducer = (ctx: CtxmenuContext) => {
      // find a file tree item
      const fileTreeItem = findFileTreeItem(ctx);
      const dir = this.appdir.getDirectory();

      if (fileTreeItem) {
        const filePath = fileTreeItem.getAttribute("data-mn-file-path");
        const disableRename =
          fileTreeItem.getAttribute("data-mn-disable-rename") === "true";

        if (filePath) {
          const buttons = [
            {
              name: "Open file",
              click: () => {
                this.editors.open(filePath);
              },
            },
            {
              name: "Delete file",
              click: () => {
                (async () => {
                  const action = await this.popups.promptButtons(
                    `Are you sure you want to move the file "${filePath}" to the trash?`,
                    [
                      {
                        text: "Cancel",
                        command: "cancel",
                        kind: "normal",
                      },
                      {
                        text: "Confirm",
                        command: "confirm",
                        kind: "emphasis",
                      },
                    ]
                  );

                  if (action === "cancel") return;
                  await this.fs.moveToTrash(filePath);
                })();
              },
            },
          ];

          if (!disableRename) {
            buttons.push({
              name: "Rename file",
              click: () => {
                const extension = this.fs.getPathExtension(filePath);
                const dotExtension =
                  extension.length > 0 ? "." + extension : "";
                const fullFileName = this.fs.getPathName(filePath);
                const fileName = fullFileName.slice(
                  0,
                  dotExtension.length > 0
                    ? -dotExtension.length
                    : fullFileName.length
                );

                this.popups
                  .promptTextInput(`Rename file "${fullFileName}"`, fileName)
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

          if (this.fs.canShowInExplorer()) {
            buttons.push(makeShowInExplorerButton(filePath));
          }

          return buttons;
        } else {
          const dirPath = fileTreeItem.getAttribute("data-mn-dir-path");
          if (dirPath) {
            // a directory
            const buttons = [
              {
                name: "Delete folder",
                click: () => {
                  (async () => {
                    const action = await this.popups.promptButtons(
                      `Are you sure you want to move the folder "${dirPath}" to the trash?`,
                      [
                        {
                          text: "Cancel",
                          command: "cancel",
                          kind: "normal",
                        },
                        {
                          text: "Confirm",
                          command: "confirm",
                          kind: "emphasis",
                        },
                      ]
                    );

                    if (action === "cancel") return;
                    await this.fs.moveToTrash(dirPath);
                  })();
                },
              },
              makeNewFolderButton(dirPath),
              makeNewFileButton(dirPath),
            ];

            if (!disableRename) {
              buttons.push({
                name: "Rename folder",
                click: () => {
                  const dirName = this.fs.getPathName(dirPath);

                  this.popups
                    .promptTextInput(`Rename folder "${dirName}"`, dirName)
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

            if (this.fs.canShowInExplorer()) {
              buttons.push(makeShowInExplorerButton(dirPath));
            }

            return buttons;
          }
        }
      } else if (ctx.elements.includes(this.element) && dir) {
        // right clicked directly on the file tree
        return [
          makeNewFolderButton(dir as string),
          makeNewFileButton(dir as string),
        ];
      }
    };

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
