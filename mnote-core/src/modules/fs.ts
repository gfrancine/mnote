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
      return await this.fs.writeTextFile(path, contents);
    }
  }

  async readTextFile(path: string): Promise<string> {
    if (this.fs) {
      return await this.fs.readTextFile(path);
    }
    return ".";
  }

  async readDir(path: string): Promise<FileItemWithChildren> {
    if (this.fs) {
      return await this.fs.readDir(path);
    }
    return {
      path: "TEMP",
      children: [],
    };
  }

  async isFile(path: string): Promise<boolean> {
    if (this.fs) {
      return await this.fs.isFile(path);
    }
    return false;
  }

  async isDir(path: string): Promise<boolean> {
    if (this.fs) {
      return await this.fs.isDir(path);
    }
    return false;
  }

  async dialogOpen(opts: {
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    if (this.fs) {
      return await this.fs.dialogOpen(opts);
    }
  }

  async dialogOpenMultiple(opts: {
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    if (this.fs) {
      return await this.fs.dialogOpenMultiple(opts);
    }
  }

  async dialogSave(opts: {
    extensions?: string[];
  }): Promise<string | void> {
    if (this.fs) {
      return await this.fs.dialogSave(opts);
    }
  }

  async getConfigDir(): Promise<string> {
    if (this.fs) {
      return await this.fs.getConfigDir();
    }
    return ".";
  }

  async getCurrentDir(): Promise<string> {
    if (this.fs) {
      return await this.fs.getCurrentDir();
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
    if (this.fs) {
      return await this.fs.watchInit(path);
    }
  }

  onWatchEvent(handler: () => void | Promise<void>) {
    if (this.fs) {
      return this.fs.onWatchEvent(handler);
    }
  }
}