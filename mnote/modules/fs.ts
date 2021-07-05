import {
  FileItem,
  FileItemWithChildren,
  FsInteropModule,
  Mnote,
} from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

export class FSModule implements FsInteropModule {
  fs?: FsInteropModule;

  constructor(_app: Mnote, fs?: FsInteropModule) {
    if (fs) this.fs = fs;
  }

  async writeTextFile(path: string, contents: string): Promise<void> {
    if (this.fs) {
      return this.fs.writeTextFile(path, contents);
    }
  }

  async readTextFile(path: string): Promise<string> {
    if (this.fs) {
      return this.fs.readTextFile(path);
    }
    return ".";
  }

  async readDir(path: string): Promise<FileItemWithChildren> {
    if (this.fs) {
      const entries = this.fs.readDir(path);
      return entries;
    }
    return {
      path: "TEMP",
      children: [],
    };
  }

  async isFile(path: string): Promise<boolean> {
    if (this.fs) {
      return this.fs.isFile(path);
    }
    return false;
  }

  async isDir(path: string): Promise<boolean> {
    if (this.fs) {
      return this.fs.isDir(path);
    }
    return false;
  }

  async dialogOpen(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    if (this.fs) {
      return this.fs.dialogOpen(opts);
    }
  }

  async dialogOpenMultiple(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    if (this.fs) {
      return this.fs.dialogOpenMultiple(opts);
    }
  }

  async dialogSave(opts: {
    initialPath?: string;
    extensions?: string[];
  }): Promise<string | void> {
    if (this.fs) {
      return this.fs.dialogSave(opts);
    }
  }

  async getConfigDir(): Promise<string> {
    if (this.fs) {
      return this.fs.getConfigDir();
    }
    return ".";
  }

  async getCurrentDir(): Promise<string> {
    if (this.fs) {
      return this.fs.getCurrentDir();
    }
    return ".";
  }
}
