import { DialogFileType } from "../common/types";
import type { TabManager } from "./editors-tab";

// used by the extension module
export interface Extension {
  startup(): void;
  cleanup(): void;
}

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor
// https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/pawDrawEditor.ts

export type DocInfo = {
  name: string;
  path?: string;
  saved: boolean;
};

export type EditorContext = {
  updateEdited(): void; // notify the app that the document has changed
  getDocument(): DocInfo | undefined;
  setDocument(doc: DocInfo): void;
};

export interface Editor {
  startup(container: HTMLElement, ctx: EditorContext): void | Promise<void>; // setup editor on element
  cleanup(): void | Promise<void>; // clear state, called before closing / switching to a new doc

  load(path: string): void | Promise<void>; // import contents as needed, the editor guarantees the path exists
  save(path: string): void | Promise<void>; // write to file. the editor guarantees the path exists
}

export interface EditorProvider {
  // getExtensions(): string[] // allowed extensions for Save As prompt
  tryGetEditor(path: string): Editor | void | Promise<Editor | void>;
  createNewEditor(): Editor | Promise<Editor>;
}

export type EditorInfo = {
  kind: string;
  provider: EditorProvider;
  /** Hide the editor from the "+" (new) menu */
  hideFromNewMenu?: boolean;
  /** What file types (name, extension) to save as */
  saveAsFileTypes?: DialogFileType[];
  /** Disable the save as dialog. Useful for non-file system editors */
  disableSaveAs?: boolean;
  /** Get the editor's icon registered from the file icons module */
  registeredIconKind?: string;
};

export type TabInfo = {
  editorKind: string;
  editorInfo: EditorInfo;
  editor: Editor;
  document: DocInfo;
  container: HTMLElement;
};

export type Tab = {
  info: TabInfo;
  manager: TabManager;
};

// context provided to editor tab managers
export type TabContext = {
  getTabInfo: () => TabInfo;
  setDocument: (doc: DocInfo) => void;
};

// right click context menu context
export type Context = {
  pageX: number;
  pageY: number;
  elements: Element[];
};

export type PromptButton = {
  text: string;
  command: string;
  kind: "emphasis" | "normal";
};

export type FileIcon = {
  kind: string;
  factory: (fillClass: string, strokeClass: string) => Element;
  shouldUse: (path: string) => boolean;
};
