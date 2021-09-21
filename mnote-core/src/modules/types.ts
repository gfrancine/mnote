import { DialogFilter } from "../common/types";
import type { TabManager } from "./editors-tab";
import { enStrings } from "../common/strings";
import type { Mnote } from "..";
import { Emitter } from "mnote-util/emitter";
import * as SettingsInputs from "./settings-inputs";

// used by the extension module
export interface Extension {
  startup(app: Mnote): void;
  cleanup(app: Mnote): void;
}

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor
// https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/pawDrawEditor.ts

export type DocInfo = {
  name: string;
  path?: string;
  saved: boolean;
};

export type EditorContextEvents = {
  tabShow: () => unknown;
  tabHide: () => unknown;
  tabMount: () => unknown;
  tabUnmount: () => unknown;
};

export type EditorContext = {
  updateEdited(): void; // notify the app that the document has changed
  getDocument(): DocInfo;
  setDocument(doc: DocInfo): void;
  events: Emitter<EditorContextEvents>;
};

export interface Editor {
  startup(container: HTMLElement, ctx: EditorContext): void | Promise<void>; // setup editor on element
  cleanup(): void | Promise<void>; // clear state, called before closing / switching to a new doc
  save(path: string): void | Promise<void>; // write to file. the editor guarantees the path exists
}

export type EditorInfo = {
  kind: string;
  canOpenPath: (path: string) => boolean | Promise<boolean>;
  createNewEditor: () => Editor | Promise<Editor>;
  /** Hide the editor from the "+" (new) menu */
  hideFromNewMenu?: boolean;
  /** What file types (name, extension) to save as */
  saveAsFileTypes?: DialogFilter[];
  /** Disable the save as dialog. Useful for non-file system editors */
  disableSaveAs?: boolean;
  /** Get the editor's icon registered from the file icons module */
  registeredIconKind?: string;
};

export type TabInfo = {
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
export type CtxmenuContext = {
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

export type ThemeInfo = {
  name: string;
  colors: Record<string, string>;
};

export type StringsDictionary = typeof enStrings;

export type SettingsCategories = "core" | "extensions";

export type SettingsSubcategory = {
  title: string;
  key: string;
  category: SettingsCategories;
  iconFactory?: (fillClass: string, strokeClass: string) => Element;
};

// settings are kept in JSON

export type SettingsPrimitive =
  | string
  | number
  | boolean
  | null;

export type SettingsValue =
  | SettingsPrimitive
  | SettingsPrimitive[]
  | Record<string, SettingsPrimitive>;

export type Settings = Record<string, SettingsValue>;

export { SettingsInputs };

export type SettingsInput =
  | SettingsInputs.Boolean
  | SettingsInputs.String
  | SettingsInputs.Number
  | SettingsInputs.Select;

// the settings module keeps an index that changes every time  an
// input/category is added so it maps directly to the UI layout

export type SettingsSubcategoryInfo = {
  subcategory: SettingsSubcategory;
  inputs: Record<string, SettingsInput>;
};

export type SettingsInputIndex = {
  core: Record<string, SettingsSubcategoryInfo>;
  extensions: Record<string, SettingsSubcategoryInfo>;
};
