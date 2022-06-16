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

// path fallback implementation

const EXTENSION_REGEX = /(\.([^.\\/]+))[\\/]?$/;
const NAME_REGEX = /([^\\/]+)[\\/]?$/;
const PARENT_REGEX = /(.+)[\\/][^\\/]+[\\/]?$/;

/** returns the entire path if not found */
function getPathName(path: string): string {
  const matches = path.match(NAME_REGEX);
  if (matches) return matches[1];
  return path;
}

/** without the leading ".", returns a blank string if not found */
function getPathExtension(path: string): string {
  const matches = path.match(EXTENSION_REGEX);
  if (matches) return matches[2];
  return "";
}

/** returns the parent directory path */
function getPathParent(path: string): string {
  const matches = path.match(PARENT_REGEX);
  if (matches) return matches[1];
  return path;
}

export class FSModule implements FsInteropModule {
  private fs?: Partial<FsInteropModule>;

  constructor(fs?: Partial<FsInteropModule>) {
    if (fs) this.fs = fs;
  }

  async writeTextFile(path: string, contents: string): Promise<void> {
    await this.fs?.writeTextFile?.(path, contents);
  }

  readTextFile(path: string): Promise<string> {
    if (this.fs?.readTextFile) return this.fs.readTextFile(path);
    return Promise.resolve("");
  }

  async writeBinaryFile(path: string, contents: ArrayBuffer): Promise<void> {
    await this.fs?.writeBinaryFile?.(path, contents);
  }

  readBinaryFile(path: string): Promise<ArrayBuffer> {
    if (this.fs?.readBinaryFile) return this.fs.readBinaryFile(path);
    return Promise.resolve(new Uint8Array());
  }

  readDir(
    path: string,
    opts: FsReadDirOptions = { recursive: true }
  ): Promise<FileItemWithChildren> {
    if (this.fs?.readDir) return this.fs.readDir(path, opts);
    return Promise.resolve({
      path: "",
      children: [],
    });
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await this.fs?.renameFile?.(path, newPath);
  }

  async renameDir(path: string, newPath: string): Promise<void> {
    await this.fs?.renameDir?.(path, newPath);
  }

  async removeFile(path: string): Promise<void> {
    await this.fs?.removeFile?.(path);
  }

  async removeDir(path: string): Promise<void> {
    await this.fs?.removeDir?.(path);
  }

  async createDir(path: string): Promise<void> {
    await this.fs?.createDir?.(path);
  }

  async ensureDir(path: string) {
    if (!(await this.isDir(path))) {
      if (await this.isFile(path)) {
        this.removeFile(path);
      }
      await this.createDir(path);
    }
  }

  async moveToTrash(path: string): Promise<void> {
    await this.fs?.moveToTrash?.(path);
  }

  isFile(path: string): Promise<boolean> {
    if (this.fs?.isFile) return this.fs.isFile(path);
    return Promise.resolve(false);
  }

  isDir(path: string): Promise<boolean> {
    if (this.fs?.isDir) return this.fs.isDir(path);
    return Promise.resolve(false);
  }

  dialogOpen(opts: {
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    if (this.fs?.dialogOpen) return this.fs.dialogOpen(opts);
    return Promise.resolve();
  }

  dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    if (this.fs?.dialogSave) return this.fs.dialogSave(opts);
    return Promise.resolve();
  }

  getDataDir(): Promise<string> {
    if (this.fs?.getDataDir) return this.fs.getDataDir();
    return Promise.resolve("");
  }

  getCurrentDir(): Promise<string> {
    if (this.fs?.getCurrentDir) return this.fs.getCurrentDir();
    return Promise.resolve("");
  }

  getPathName(path: string) {
    if (this.fs?.getPathName) return this.fs.getPathName(path);
    return getPathName(path);
  }

  getPathParent(path: string) {
    if (this.fs?.getPathParent) return this.fs.getPathParent(path);
    return getPathParent(path);
  }

  getPathExtension(path: string) {
    if (this.fs?.getPathExtension) return this.fs.getPathExtension(path);
    return getPathExtension(path);
  }

  joinPath(items: string[]): string {
    if (this.fs?.joinPath) return this.fs.joinPath(items);
    return items.join("/");
  }

  ensureSeparatorAtEnd(path: string) {
    if (this.fs?.ensureSeparatorAtEnd) {
      return this.fs.ensureSeparatorAtEnd(path);
    }
    if (path.charAt(path.length - 1) !== "/") return path + "/";
    return path;
  }

  resolvePath(basePath: string, relativePath: string) {
    if (this.fs?.resolvePath) {
      return this.fs.resolvePath(basePath, relativePath);
    }
    return relativePath;
  }

  convertImageSrc(src: string) {
    if (this.fs?.convertImageSrc) return this.fs.convertImageSrc(src);
    return src;
  }

  async watch(path: string) {
    await this.fs?.watch?.(path);
  }

  async unwatch(path: string) {
    await this.fs?.unwatch?.(path);
  }

  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    return this.fs?.onWatchEvent?.(event, handler);
  }

  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    return this.fs?.offWatchEvent?.(event, handler);
  }

  async showInExplorer(path: string) {
    await this.fs?.showInExplorer?.(path);
  }
}
