// used by the extension module
export interface Extension {
  startup(): void;
  cleanup(): void;
}

// https://code.visualstudio.com/api/extension-guides/custom-editors#custom-editor
// https://github.com/microsoft/vscode-extension-samples/blob/main/custom-editor-sample/src/pawDrawEditor.ts

export interface Editor {
  startup(container: HTMLElement): void | Promise<void>;
  cleanup(): void | Promise<void>;

  load(path: string): void | Promise<void>; // the editor guarantees the file exists
  save(): void | Promise<void>;
  saveAs(path: string): void | Promise<void>;
  isSaved(): boolean;
  hasPath(): boolean;
}

export interface EditorProvider {
  tryGetEditor(path: string): Editor | undefined;
  createNewEditor(): Editor;
}

export type MenuButton = {
  name: string;
  shortcutText: string; // just for display
  onClick?: () => void;
  buttons?: MenuButton[];
};

export type MenubarButton = {
  name: string;
  buttons: MenuButton[];
};
