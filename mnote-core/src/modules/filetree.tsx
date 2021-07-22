import { FileTreeNodeWithChildren, MenuItem, Mnote } from "../common/types";
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
import { strings } from "../common/strings";
import { getPathParent } from "../../../mnote-util/path";
import { PromptsModule } from "./prompts";

export class FiletreeModule {
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
  tree?: FileTreeNodeWithChildren;
  app: Mnote;
  directory = "";

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

    if (startPath) {
      if (await this.fs.isDir(startPath)) {
        this.directory = startPath;
      } else if (await this.fs.isFile(startPath)) {
        startFile = startPath;
        const dir = getPathParent(startPath);
        this.directory = dir;
      } else {
        this.directory = await this.fs.getCurrentDir();
        this.prompts.notify(strings.noStartPath(startPath));
      }
    } else {
      this.directory = await this.fs.getCurrentDir();
    }

    this.fs.onWatchEvent(() => this.refreshTree());
    this.fs.watchInit(this.directory);
    this.refreshTree();

    if (startFile) this.setSelectedFile(startFile);
  }

  async refreshTree() {
    const tree = await this.fs.readDir(this.directory); // replace with watcher?

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

  protected updateDisplay() {
    this.logging.info("filetree updateDisplay", this.tree, this.selectedFile);

    render(
      <FileTree
        node={this.tree as FileTreeNodeWithChildren}
        handleFocus={(path: string) => {
          this.logging.info("path focused", path);
          this.setSelectedFile(path);
        }}
        initFocusedNode={this.selectedFile}
      />,
      this.element,
    );
  }
}
