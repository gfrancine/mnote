// used by the extension module
export interface Extension {
  startup(): void;
  cleanup(): void;
}

export interface Editor {
  startup(path: string, container: HTMLElement): void;
  cleanup(): void;
  handleSave(): void;
}

export type GetEditorFunction = (path: string) => Editor | undefined;
