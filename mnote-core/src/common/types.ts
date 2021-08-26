// common types used by the files
// has no dependencies, except for standalone
// utilities like Emitter
import { Emitter } from "mnote-util/emitter";

export type Module = unknown;

export type Mnote = {
  options: MnoteOptions;

  element: Element;

  container: Element;

  hooks: Emitter<{
    startup: () => Promise<void> | void;
  }>;

  modules: Record<string, Module>;
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

export type DialogFileType = { name: string; extensions: string[] };

export type FsWatcherEvents = {
  event: () => void | Promise<void>;
  write: (path: string) => void | Promise<void>;
  remove: (path: string) => void | Promise<void>;
  rename: (path: string, targetPath: string) => void | Promise<void>;
};

export interface FsInteropModule {
  //todo
  writeTextFile(path: string, contents: string): Promise<void>;
  readTextFile(path: string): Promise<string>;
  readDir(
    path: string,
    options?: FsReadDirOptions,
  ): Promise<FileItemWithChildren>;
  renameFile(path: string, newPath: string): Promise<void>;
  renameDir(path: string, newPath: string): Promise<void>;
  removeFile(path: string): Promise<void>;
  removeDir(path: string): Promise<void>;
  createDir(path: string): Promise<void>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
  dialogOpen(opts: {
    fileTypes?: DialogFileType[];
    directory: boolean;
    startingPath?: string;
  }): Promise<string | void>;
  dialogSave(opts: {
    fileTypes?: DialogFileType[];
    startingPath?: string;
  }): Promise<string | void>;
  getConfigDir(): Promise<string>;
  getCurrentDir(): Promise<string>;
  joinPath(items: string[]): string;

  watchInit(path: string): Promise<void>;
  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ): void;
  // weird a** semantics
  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ): void;
}

export type FileItem = {
  path: string;
  children?: FileItem[];
};

export type FileItemWithChildren = {
  path: string;
  children: FileItem[];
};

export type FsReadDirOptions = {
  recursive?: boolean;
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

export type FileTreeHooks = {
  fileFocused?: (path: string) => void | Promise<void>;
  fileDroppedOnDir?: (
    targetDir: string,
    droppedFile: string,
  ) => void | Promise<void>;
  dirDroppedOnDir?: (
    targetDir: string,
    droppedDir: string,
  ) => void | Promise<void>;
};

// data needed by the Open Files list
export type OpenFile = {
  name: string;
  saved: boolean;
  index: number; // instead of the path, this is the primary key
  path?: string;
  getIcon: (fillClass: string, strokeClass: string) => Element | void;
  onSave: (file: OpenFile) => void | Promise<void>;
  onOpen: (file: OpenFile) => void | Promise<void>;
  onClose: (file: OpenFile) => void | Promise<void>;
};

// (context) menu

export type MenuItem = {
  name: string;
  shortcut?: string;
  click: (e: MouseEvent) => void;
};

// system module

export interface SystemInteropModule {
  usesCmd: () => boolean;
  hookToQuit: (hook: SystemCancelQuitHook) => void;
}

export type SystemCancelQuitHook = (cancel: () => void) => void | Promise<void>;
