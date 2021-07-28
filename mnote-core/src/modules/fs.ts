import {
  DialogFileType,
  FileItemWithChildren,
  FsInteropModule,
} from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

export class FSModule implements FsInteropModule {
  protected fs?: FsInteropModule;

  constructor(fs?: FsInteropModule) {
    if (fs) this.fs = fs;
  }

  writeTextFile(path: string, contents: string): Promise<void> {
    return this.fs ? this.fs.writeTextFile(path, contents) : Promise.resolve();
  }

  readTextFile(path: string): Promise<string> {
    if (this.fs) {
      return this.fs.readTextFile(path);
    }
    return Promise.resolve("");
  }

  readDir(path: string): Promise<FileItemWithChildren> {
    if (this.fs) {
      return this.fs.readDir(path);
    }
    return Promise.resolve({
      path: "TEMP",
      children: [],
    });
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

  isFile(path: string): Promise<boolean> {
    if (this.fs) {
      return this.fs.isFile(path);
    }
    return Promise.resolve(false);
  }

  isDir(path: string): Promise<boolean> {
    if (this.fs) {
      return this.fs.isDir(path);
    }
    return Promise.resolve(false);
  }

  dialogOpen(opts: {
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    return this.fs ? this.fs.dialogOpen(opts) : Promise.resolve();
  }

  dialogSave(opts: {
    fileTypes?: DialogFileType[];
  }): Promise<string | void> {
    return this.fs ? this.fs.dialogSave(opts) : Promise.resolve();
  }

  getConfigDir(): Promise<string> {
    if (this.fs) {
      return this.fs.getConfigDir();
    }
    return Promise.resolve(".");
  }

  getCurrentDir(): Promise<string> {
    if (this.fs) {
      return this.fs.getCurrentDir();
    }
    return Promise.resolve(".");
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
