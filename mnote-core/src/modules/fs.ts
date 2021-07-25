import { FileItemWithChildren, FsInteropModule } from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

export class FSModule implements FsInteropModule {
  protected fs?: FsInteropModule;

  constructor(fs?: FsInteropModule) {
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
      return this.fs.readDir(path);
    }
    return {
      path: "TEMP",
      children: [],
    };
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await this.fs?.renameFile(path, newPath);
  }

  async removeFile(path: string): Promise<void> {
    await this.fs?.removeFile(path);
  }

  async removeDir(path: string): Promise<void> {
    await this.fs?.removeDir(path);
  }

  async createDir(path: string): Promise<void> {
    await this.fs?.createDir(path);
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
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    return this.fs?.dialogOpen(opts);
  }

  async dialogOpenMultiple(opts: {
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    await this.fs?.dialogOpenMultiple(opts);
  }

  async dialogSave(opts: {
    extensions?: string[];
  }): Promise<string | void> {
    return this.fs?.dialogSave(opts);
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

  joinPath(items: string[]): string {
    if (this.fs) {
      return this.fs.joinPath(items);
    }
    return items.join("/");
  }

  async watchInit(path: string) {
    await this.fs?.watchInit(path);
  }

  onWatchEvent(handler: () => void | Promise<void>) {
    this.fs?.onWatchEvent(handler);
  }
}
