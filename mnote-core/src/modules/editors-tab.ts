import { getPathName } from "../../../mnote-util/path";
import { strings } from "../common/strings";
import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { PromptsModule } from "./prompts";
import {
  DocInfo,
  Editor,
  EditorContext,
  PromptButton,
  TabContext,
} from "./types";

export class TabManager {
  ctx: TabContext;
  app: Mnote;

  fs: FSModule;
  prompts: PromptsModule;

  constructor(app: Mnote, ctx: TabContext) {
    this.ctx = ctx;
    this.app = app;

    this.fs = app.modules.fs as FSModule;
    this.prompts = app.modules.prompts as PromptsModule;
  }

  async startup() {
    const { document, container, editor } = this.ctx.getTabInfo();
    await editor.startup(container, this.makeContext());
    if (document.path) await editor.load(document.path);
    return this;
  }

  private makeContext(): EditorContext {
    return {
      updateEdited: () => {
        const doc = this.ctx.getTabInfo().document;
        doc.saved = false;
        this.ctx.setDocument(doc);
      },
      getDocument: () => this.ctx.getTabInfo().document,
      setDocument: (doc: DocInfo) => this.ctx.setDocument(doc),
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
      this.prompts.notify(strings.saveError(e));
      console.error(e);
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
        fileTypes: editorInfo.saveAsFileTypes,
      });

    console.log("new path", newPath);
    if (!newPath) return false;

    const newPathName = getPathName(newPath);
    const newDoc = {
      path: newPath,
      name: newPathName,
      saved: false,
    };
    this.ctx.setDocument(newDoc);

    const success = await this.trySaveEditor(editor, newDoc);
    if (!success) return false;
    this.ctx.setDocument({
      ...newDoc,
      saved: true,
    });

    return true;
  }

  async close(): Promise<boolean> {
    const { editor, document } = this.ctx.getTabInfo();

    if (document.saved) {
      await editor.cleanup();
      return true;
    } else {
      const action = await this.prompts.promptButtons(
        strings.confirmSaveBeforeClose(),
        confirmCloseButtons, // see bottom of file
      );

      switch (action as "cancel" | "save" | "dontsave") {
        case "save":
          if (await this.save()) {
            await editor.cleanup();
            return true;
          } else {
            return false;
          }
        case "cancel":
          return false;
        case "dontsave":
          await editor.cleanup();
          return true;
      }
    }
  }
}

const confirmCloseButtons: PromptButton[] = [
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
];
