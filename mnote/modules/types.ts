// used by the extension module
export interface Extension {
  startup(): void;
  cleanup(): void;
}

export interface Editor {
  startup(container: HTMLElement): void;
  cleanup(): void;
  load(path: string): void;
  save(): void;
}

export interface EditorProvider {
  tryOpen(path: string): Editor | undefined;
  createNew(): Editor;
}
