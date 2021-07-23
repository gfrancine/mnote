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

export class FiletreeModule {
  app: Mnote;
  element: HTMLElement;
  fs: FSModule;
  layout: LayoutModule;
  ctxmenu: CtxmenuModule;
  logging: LoggingModule;
  prompts: PromptsModule;

  events: Emitter<{
    selected: (path: string) => void;
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
    this.layout = app.modules.layout as LayoutModule;
    this.ctxmenu = app.modules.ctxmenu as CtxmenuModule;
    this.logging = app.modules.logging as LoggingModule;
    this.prompts = app.modules.prompts as PromptsModule;

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
    this.events.emitSync("selected", path);
    this.updateDisplay();
  }

  setDirectory(path: string) {
    this.logging.info("setDirectory", path);
    //
    // todo: close the existing watcher
    //
    this.directory = path;
    this.fs.watchInit(path)
      .then(() => this.refreshTree());
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
      }
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
