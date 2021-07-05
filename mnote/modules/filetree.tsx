import { FileTreeNodeWithChildren, Mnote } from "../common/types";
import { Emitter } from "../common/emitter";
import { el } from "../common/elbuilder";
import { Context } from "./types";
import { FSModule } from "./fs";
import { LayoutModule } from "./layout";
import { CtxmenuModule } from "./ctxmenu";
import { LoggingModule } from "./logging";

import { h, render, VNode } from "preact";
import FileTree from "../components/filetree";

export class FiletreeModule {
  element: HTMLElement;
  fs: FSModule;
  layout: LayoutModule;
  ctxmenu: CtxmenuModule;
  logging: LoggingModule;
  events: Emitter<{
    selected: (path: string) => void;
  }> = new Emitter();
  selectedFile?: string;

  constructor(app: Mnote) {
    this.element = el("div")
      .class("filetree-container")
      .element;

    this.fs = app.modules.fs as FSModule;
    this.layout = app.modules.layout as LayoutModule;
    this.ctxmenu = app.modules.ctxmenu as CtxmenuModule;
    this.logging = app.modules.logging as LoggingModule;

    const ctxmenuReducer = (ctx: Context) => {};

    this.ctxmenu.addSectionReducer(ctxmenuReducer);

    this.layout.mountToFiletree(this.element);

    this.fs.readDir(app.directory) // replace with watcher?
      .then((tree) => {
        if (tree.children) {
          this.setFileTree(tree as FileTreeNodeWithChildren);
        } else {
          this.logging.err(
            "filetree read directory - no children, Dir:",
            app.directory,
          );
        }
      })
      .catch((err) => {
        this.logging.err(
          "filetree read directory - failure, Dir:",
          app.directory,
          "Err:",
          err,
        );
      });
  }

  setFileTree(tree: FileTreeNodeWithChildren) {
    this.logging.info("setFileTree", tree);

    render(
      <FileTree
        node={tree}
        handleFocus={(path: string) => {
          this.logging.info("path focused", path);
          this.selectedFile = path;
          this.events.emitSync("selected", path);
        }}
        initFocusedNode={this.selectedFile}
      />,
      this.element,
    );
  }
}
