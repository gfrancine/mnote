import {
  FileTreeHooks,
  FileTreeNode,
  FileTreeNodeWithChildren,
} from "../types";
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
import { createRoot, Root } from "react-dom/client";
import React from "react";
import FileTree from "./filetree-component";
import { SystemModule } from "./system";

function FileTreePlaceholder() {
  return <div className="placeholder-nothing">No Opened Folder</div>;
}

export class FiletreeModule {
  private element: HTMLElement;
  private reactRoot: Root;

  private fs: FSModule;
  private system: SystemModule;
  private layout: LayoutModule;
  private ctxmenu: CtxmenuModule;
  private log: LogModule;
  private appdir: AppDirModule;
  private popups: PopupsModule;
  private editors: EditorsModule;
  private fileicons: FileIconsModule;
  private filesearch: FileSearchModule;

  // this VV is maintained by the filetree-component
  private selectedPaths: Record<string, "file" | "dir"> = {};
  private openedFile?: string;
  private tree?: FileTreeNodeWithChildren;
  private searchTerm?: string;

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
    this.system = app.modules.system;
    this.layout = app.modules.layout;
    this.ctxmenu = app.modules.ctxmenu;
    this.log = app.modules.log;
    this.popups = app.modules.popups;
    this.appdir = app.modules.appdir;
    this.editors = app.modules.editors;
    this.fileicons = app.modules.fileicons;
    this.filesearch = app.modules.filesearch;

    this.element = el("div").class("filetree-container").element;

    this.reactRoot = createRoot(this.element);

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

  setOpenedFile(path?: string) {
    this.log.info("filetree: setOpenedFile", path);
    this.openedFile = path;
    this.updateTree();
  }

  private updateTree() {
    this.log.info("filetree: updateTree", this.tree, this.openedFile);

    const hooks: FileTreeHooks = {
      fileClicked: (path: string) => {
        this.log.info("filetree: file clicked", path);
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

    console.log("usescmd", this.system.usesCmd());

    if (this.tree) {
      this.reactRoot.render(
        <FileTree
          node={this.tree}
          hooks={hooks}
          initOpenedFile={this.openedFile}
          getFileIcon={getFileIcon}
          searchTerm={this.searchTerm}
          modKey={
            // Doesn't work on a mac
            // this.system.usesCmd() ? "Command" : "Control"
            "Shift"
          }
          updateSelectedPaths={(paths) => {
            this.selectedPaths = paths;
          }}
          getPathName={(path: string) => this.fs.getPathName(path)}
          ensureSeparatorAtEnd={(path: string) =>
            this.fs.ensureSeparatorAtEnd(path)
          }
        />
      );
    } else {
      this.reactRoot.render(<FileTreePlaceholder />);
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

      // order:
      // 1. selection
      // 2. item directlyclicked on
      // 3. the file tree element
      if (fileTreeItem && Object.values(this.selectedPaths).length > 0) {
        return [
          {
            name: "Delete All",
            click: async () => {
              const paths = Object.keys(this.selectedPaths);
              const confirmed = await this.popups.confirm(
                `Are you sure you want to move ${paths.length} item(s) to the trash?`
              );

              if (!confirmed) return;
              // will throw errors if the user selects a directory before
              // its descendants, they can be ignored
              this.log.info("filetree: Delete All", paths);
              paths.forEach((path) => this.fs.moveToTrash(path));
            },
          },
        ];
      } else if (fileTreeItem) {
        const filePath = fileTreeItem.getAttribute("data-mn-file-path");
        const dirPath = fileTreeItem.getAttribute("data-mn-dir-path");
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
                  const confirmed = await this.popups.confirm(
                    `Are you sure you want to move the file "${filePath}" to the trash?`
                  );

                  if (!confirmed) return;
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

          buttons.push(makeShowInExplorerButton(filePath));

          return buttons;
        } else if (dirPath) {
          // a directory
          const buttons = [];

          if (this.tree?.path === dirPath) {
            buttons.push({
              name: "Close folder",
              click: () => {
                this.appdir.closeDirectory();
              },
            });
          } else {
            buttons.push({
              name: "Delete folder",
              click: () => {
                (async () => {
                  const confirmed = await this.popups.confirm(
                    `Are you sure you want to move the folder "${dirPath}" to the trash?`
                  );

                  if (!confirmed) return;
                  await this.fs.moveToTrash(dirPath);
                })();
              },
            });
          }

          buttons.push(
            makeNewFolderButton(dirPath),
            makeNewFileButton(dirPath)
          );

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

          buttons.push(makeShowInExplorerButton(dirPath));

          // save current file here as ...
          if (
            this.editors.currentTab &&
            !this.editors.currentTab.info.editorInfo.disableSaveAs
          ) {
            buttons.push({
              name: "Save current file here as...",
              click: async () => {
                const tab = this.editors.currentTab;
                if (!tab) return;
                this.log.info("Save current file in dir", dirPath, tab);

                const extension = this.fs.getPathExtension(
                  tab.info.document.name
                );
                let name = await this.popups.promptTextInput(
                  `Save current file in folder as...`,
                  this.fs
                    .getPathName(tab.info.document.name)
                    .slice(0, -extension.length - 1)
                );
                if (!name) return;
                name += "." + extension;
                const newPath = this.fs.joinPath([dirPath, name]);

                if (await this.fs.isFile(newPath)) {
                  const overwrite = await this.popups.confirm(
                    `A file named "${name}" already exists in the directory. Would you like to overwrite it?`
                  );
                  if (!overwrite) return;
                }

                this.editors.saveAs(tab, newPath);
              },
            });
          }

          return buttons;
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
        this.setOpenedFile(this.editors.currentTab.info.document.path);
      } else {
        this.setOpenedFile(undefined);
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
