// common types used by the files

import { Node, NodeWithChildren } from "mnote-util/nodes";

// options mainly for interop
// 1. app receives these options, including functions for modules
// 2. app creates some of the modules with arguments from here
//    (for example, instantiate fs module with the fs object)
// 3. modules: if they don't receive the argument, mock all the
//    functionality
export type MnoteOptions = {
  startPath?: string;
  fs?: Partial<FsInteropModule>;
  system?: Partial<SystemInteropModule>;
  isProduction?: boolean;
  dataDirectoryName?: string;
  appSettingsFileName?: string;
};

export type DialogFilter = { name: string; extensions: string[] };

export type FsWatcherEvents = {
  event: () => void | Promise<void>;
  create: (path: string) => void | Promise<void>;
  write: (path: string) => void | Promise<void>;
  remove: (path: string) => void | Promise<void>;
  rename: (path: string, targetPath: string) => void | Promise<void>;
};

export interface FsInteropModule {
  //todo
  writeTextFile(path: string, contents: string): Promise<void>;
  readTextFile(path: string): Promise<string>;
  writeBinaryFile(path: string, contents: ArrayBuffer): Promise<void>;
  readBinaryFile(path: string): Promise<ArrayBuffer>;
  readDir(
    path: string,
    options?: FsReadDirOptions
  ): Promise<FileItemWithChildren>;
  renameFile(path: string, newPath: string): Promise<void>;
  renameDir(path: string, newPath: string): Promise<void>;
  removeFile(path: string): Promise<void>;
  removeDir(path: string): Promise<void>;
  createDir(path: string): Promise<void>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
  dialogOpen(opts: {
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void>;
  dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void>;
  getConfigDir(): Promise<string>;
  getCurrentDir(): Promise<string>;

  // path
  getPathName: (path: string) => string;
  getPathParent: (path: string) => string;
  getPathExtension: (path: string) => string;
  joinPath: (fragments: string[]) => string;
  resolvePath: (basePath: string, relativePath: string) => string;
  ensureSeparatorAtEnd: (path: string) => string;

  // this method resolves an absolute file path into a fetchable link
  convertImageSrc: (path: string) => string;

  // watcher
  watch(path: string): Promise<void>;
  unwatch(path: string): Promise<void>;
  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ): void;
  // weird a** semantics
  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ): void;

  canShowInExplorer(): boolean;
  showInExplorer(path: string): Promise<void>;
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

export type FileTreeNode = Node;

export type FileTreeNodeWithChildren = NodeWithChildren;

export type FileTreeHooks = {
  fileFocused?: (path: string) => void | Promise<void>;
  fileDroppedOnDir?: (
    targetDir: string,
    droppedFile: string
  ) => void | Promise<void>;
  dirDroppedOnDir?: (
    targetDir: string,
    droppedDir: string
  ) => void | Promise<void>;
};

// system module

export type SystemAppMenuId =
  | "open-file"
  | "open-folder"
  | "close-folder"
  | "refresh-folder"
  | "save"
  | "save-as"
  | "close-editor"; // todo

export type SystemAppMenuListener = (menuId: SystemAppMenuId) => unknown;

export type SystemTheme = "light" | "dark";

export type SystemThemeListener = (theme: SystemTheme) => unknown;

export interface SystemInteropModule {
  usesCmd: () => boolean;
  hookToQuit: (hook: SystemCancelQuitHook) => void;
  onAppMenuClick: (listener: SystemAppMenuListener) => void;
  offAppMenuClick: (listener: SystemAppMenuListener) => void;
  getPreferredTheme: () => SystemTheme;
  onPreferredThemeChange: (listener: SystemThemeListener) => void;
  offPreferredThemeChange: (listener: SystemThemeListener) => void;
}

export type SystemCancelQuitHook = (cancel: () => void) => void | Promise<void>;
