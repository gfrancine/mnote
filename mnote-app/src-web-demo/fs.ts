import {
  FileItemWithChildren,
  FsInteropModule,
  FsReadDirOptions,
} from "mnote-core";

import { contents, tree } from "./mocks";

const EXTENSION_REGEX = /(\.([^.\\/]+))[\\/]?$/;

export class FS implements Partial<FsInteropModule> {
  writeTextFile(_path: string, _contents: string): Promise<void> {
    return Promise.resolve();
  }
  readTextFile(path: string): Promise<string> {
    return Promise.resolve(
      contents[this.getPathExtension(path)] || "lorem ipsum"
    );
  }
  getPathExtension(path: string) {
    const matches = path.match(EXTENSION_REGEX);
    if (matches) return matches[2];
    return "";
  }
  readDir(
    _path: string,
    _opts: FsReadDirOptions
  ): Promise<FileItemWithChildren> {
    return Promise.resolve(tree);
  }
  isFile(_path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  isDir(_path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  dialogOpen(_opts: { isDirectory: boolean }): Promise<string | void> {
    return Promise.resolve("");
  }
  dialogSave(_opts: Record<string, unknown>): Promise<string | void> {
    return Promise.resolve("");
  }
  getConfigDir(): Promise<string> {
    return Promise.resolve("configdir");
  }
  getCurrentDir(): Promise<string> {
    return Promise.resolve("currentdir");
  }
  resolveImageSrcPath() {
    return "halo bandung";
  }
  canShowInExplorer() {
    return true;
  }
  showInExplorer(path: string) {
    console.log("show in explorer", path);
    return Promise.resolve();
  }
}
