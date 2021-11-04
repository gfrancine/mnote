import { EditorContextEvents, Mnote } from "..";
import { FSModule } from "./fs";
import { PopupsModule } from "./popups";
import { DocInfo, Editor, EditorContext, TabContext } from "./types";
import { LogModule } from "./log";
import { Emitter } from "mnote-util/emitter";
import { AppDirModule } from "./appdir";

export class TabManager {
  private ctx: TabContext;

  private fs: FSModule;
  private appdir: AppDirModule;
  private popups: PopupsModule;
  private log: LogModule;

  private ctxEvents = new Emitter<EditorContextEvents>();

  constructor(app: Mnote, ctx: TabContext) {
    this.ctx = ctx;
    this.fs = app.modules.fs;
    this.appdir = app.modules.appdir;
    this.popups = app.modules.popups;
    this.log = app.modules.log;
    this.hide();
  }

  // mark the document as unsaved, remove the path
  private onWatcherRemove = (path: string) => {
    const { document } = this.ctx.getTabInfo();
    if (!document.path) return;
    if (path === document.path) {
      const newDoc = { ...document };
      delete newDoc.path;
      newDoc.saved = false;
      this.ctx.setDocument(newDoc);
    }
  };

  // update the document path and name
  private onWatcherRename = (path: string, targetPath: string) => {
    const { document } = this.ctx.getTabInfo();
    if (!document.path) return;
    if (path === document.path) {
      this.ctx.setDocument({
        ...document,
        path: targetPath,
        name: this.fs.getPathName(targetPath),
      });
    }
  };

  async startup() {
    const { container, editor } = this.ctx.getTabInfo();

    this.fs.onWatchEvent("rename", this.onWatcherRename);
    this.fs.onWatchEvent("remove", this.onWatcherRemove);

    this.show();

    await editor.startup(container, this.makeContext());
    return this;
  }

  private makeContext(): EditorContext {
    return {
      markUnsaved: () => {
        const doc = this.ctx.getTabInfo().document;

        // setDocument is too expensive to be called on every change (esp.
        // if it's per frame) because it updates the react file tree
        if (!doc.saved) return;

        doc.saved = false;
        this.ctx.setDocument(doc);
      },
      getDocument: () => this.ctx.getTabInfo().document,
      setDocument: (doc: DocInfo) => this.ctx.setDocument(doc),
      save: () => this.save(),
      events: this.ctxEvents,
    };
  }

  // DRY for saving with a prompt on error
  private async trySaveEditor(
    editor: Editor,
    document: Required<DocInfo>,
  ): Promise<boolean> {
    try {
      await editor.save(document.path);
      return true;
    } catch (e) {
      this.popups.notify(`An error occurred while saving: ${e}`);
      this.log.err(
        "editor tab: error while saving document with trySaveEditor",
        document,
        e,
      );
      return false;
    }
  }

  async save(): Promise<boolean> {
    const { document, editor } = this.ctx.getTabInfo();

    if (document.path) {
      const success = await this.trySaveEditor(
        editor,
        document as Required<DocInfo>,
      );
      if (!success) return false;
      this.ctx.setDocument({
        ...document,
        saved: true,
      });
    } else {
      const success = await this.saveAs();
      if (!success) return false;
    }

    return true;
  }

  async saveAs(): Promise<boolean> {
    const { editor, editorInfo, document } = this.ctx.getTabInfo();

    const newPath = editorInfo.disableSaveAs
      ? document.path
      : await this.fs.dialogSave({
        filters: editorInfo.saveAsFileTypes,
        startingDirectory: document.path
          ? this.fs.getPathParent(document.path)
          : this.appdir.getDirectory(),
        startingFileName: document.name,
      });

    this.log.info("editor tabs: saveAs - new path:", newPath);
    if (!newPath) return false;

    const newPathName = this.fs.getPathName(newPath);
    const newDoc = {
      path: newPath,
      name: newPathName,
      saved: false,
    };

    const success = await this.trySaveEditor(editor, newDoc);
    if (!success) return false;

    if (editorInfo.canOpenPath(newPath)) {
      this.ctx.setDocument({
        ...newDoc,
        saved: true,
      });
    }

    return true;
  }

  show() {
    const { container } = this.ctx.getTabInfo();
    container.style.display = "block";
    this.ctxEvents.emit("tabShow");
  }

  hide() {
    const { container } = this.ctx.getTabInfo();
    container.style.display = "none";
    this.ctxEvents.emit("tabHide");
  }

  mount(container: Element) {
    const tab = this.ctx.getTabInfo();
    container.appendChild(tab.container);
    this.ctxEvents.emit("tabMount");
  }

  unmount(container: Element) {
    const tab = this.ctx.getTabInfo();
    container.removeChild(tab.container);
    this.ctxEvents.emit("tabUnmount");
  }

  private async cleanup() {
    this.hide();
    this.fs.offWatchEvent("rename", this.onWatcherRename);
    this.fs.offWatchEvent("remove", this.onWatcherRemove);
    const { editor } = this.ctx.getTabInfo();
    await editor.cleanup();
  }

  async close(): Promise<boolean> {
    const { document } = this.ctx.getTabInfo();

    if (document.saved) {
      await this.cleanup();
      return true;
    } else {
      const action = await this.popups.promptButtons(
        "Would you like to save the current document before closing?",
        [
          {
            kind: "normal",
            text: "Cancel",
            command: "cancel",
          },
          {
            kind: "normal",
            text: "Don't save",
            command: "dontsave",
          },
          {
            kind: "emphasis",
            text: "Save",
            command: "save",
          },
        ],
      );

      switch (action as "cancel" | "save" | "dontsave") {
        case "save":
          if (await this.save()) {
            await this.cleanup();
            return true;
          } else {
            return false;
          }
        case "cancel":
          return false;
        case "dontsave":
          await this.cleanup();
          return true;
      }
    }
  }
}
