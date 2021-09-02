import {
  DialogFilter,
  FileItemWithChildren,
  FsInteropModule,
  FsReadDirOptions,
  FsWatcherEvents,
} from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

// todo: DRY void methods

export class FSModule implements FsInteropModule {
  private fs?: FsInteropModule;

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

  readDir(
    path: string,
    opts: FsReadDirOptions = { recursive: true },
  ): Promise<FileItemWithChildren> {
    if (this.fs) {
      return this.fs.readDir(path, opts);
    }
    return Promise.resolve({
      path: "TEMP",
      children: [],
    });
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await this.fs?.renameFile(path, newPath);
  }

  async renameDir(path: string, newPath: string): Promise<void> {
    await this.fs?.renameDir(path, newPath);
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
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    return this.fs ? this.fs.dialogOpen(opts) : Promise.resolve();
  }

  dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
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

  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ) {
    this.fs?.onWatchEvent(event, handler);
  }

  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ) {
    this.fs?.offWatchEvent(event, handler);
  }
}
