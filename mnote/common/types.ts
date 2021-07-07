// common types used by the files
// has no dependencies, except for standalone
// utilities like Emitter

export type Module = unknown;

export type Mnote = {
  options: MnoteOptions;

  element: Element;

  directory: string;

  modules: Record<string, Module>;

  addModule: (name: string, module: Module) => Mnote;
};

// options mainly for interop
// 1. app receives these options, including functions for modules
// 2. app creates some of the modules with arguments from here
//    (for example, instantiate fs module with the fs object)
// 3. modules: if they don't receive the argument, mock all the
//    functionality
export type MnoteOptions = {
  startPath?: string;
  fs?: FsInteropModule;
  system?: SystemInteropModule;
  isProduction?: boolean;
};

export interface FsInteropModule {
  //todo
  writeTextFile(path: string, contents: string): Promise<void>;
  readTextFile(path: string): Promise<string>;
  readDir(path: string): Promise<FileItemWithChildren>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
  dialogOpen(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void>;
  dialogOpenMultiple(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void>;
  dialogSave(opts: {
    initialPath?: string;
    extensions?: string[];
  }): Promise<string | void>;
  getConfigDir(): Promise<string>;
  getCurrentDir(): Promise<string>;

  watchInit(path: string): Promise<void>;
  onWatchEvent(handler: () => void | Promise<void>): void;
}

export type FileItem = {
  path: string;
  children?: FileItem[];
};

export type FileItemWithChildren = {
  path: string;
  children: FileItem[];
};

// file tree

export type FileTreeNode = {
  path: string; // path is the unique id
  children?: FileTreeNode[]; // if none, it's a file node
};

export type FileTreeNodeWithChildren = {
  path: string; // path is the unique id
  children: FileTreeNode[]; // if none, it's a file node
};

// (context) menu

export type MenuItem = {
  name: string;
  shortcut?: string;
  click: (e: MouseEvent) => void;
};

// system module

export interface SystemInteropModule {
  USES_CMD: boolean;

  registerShortcut(
    shortcut: string,
    handler: SystemShortcutHandler,
  ): Promise<void>;
}

export type SystemShortcutHandler = (shortcut: string) => void;
