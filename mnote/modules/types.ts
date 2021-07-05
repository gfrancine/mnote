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
};

export interface Editor {
  startup(container: HTMLElement, ctx: EditorContext): void | Promise<void>; // setup editor on element
  cleanup(): void | Promise<void>; // clear state, called before closing / switching to a new doc

  load(path: string): void | Promise<void>; // import contents as needed, the editor guarantees the path exists
  save(path: string): void | Promise<void>; // write to file. the editor guarantees the path exists
}

export interface EditorProvider {
  // getExtensions(): string[] // allowed extensions for Save As prompt
  tryGetEditor(path: string): Editor | undefined;
  createNewEditor(): Editor;
}

// right click context menu context
export type Context = {
  pageX: number;
  pageY: number;
  element: Element;
};

export type ModalButton = {
  text: string;
  command: string;
  kind: "emphasis" | "normal";
};
