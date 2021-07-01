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

  load(path: string): void | Promise<void>;
  save(): void | Promise<void>;
  saveAs(): void | Promise<void>;
  isSaved(): boolean;

  undo(): void | Promise<void>;
  redo(): void | Promise<void>;
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
