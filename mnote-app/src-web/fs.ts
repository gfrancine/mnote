import { FileItemWithChildren, FsInteropModule } from "mnote-core";
import { getPathExtension } from "../../mnote-util/path";
import { contents, tree } from "./mocks";

export class FS implements FsInteropModule {
  writeTextFile(_path: string, _contents: string): Promise<void> {
    return Promise.resolve();
  }
  readTextFile(path: string): Promise<string> {
    return Promise.resolve(
      contents[getPathExtension(path)] ||
        "lorem ipsum",
    );
  }
  readDir(_path: string): Promise<FileItemWithChildren> {
    return Promise.resolve(tree);
  }
  renameFile(_path: string, _newPath: string): Promise<void> {
    return Promise.resolve();
  }
  removeFile(_path: string): Promise<void> {
    return Promise.resolve();
  }
  removeDir(_path: string): Promise<void> {
    return Promise.resolve();
  }
  isFile(_path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  isDir(_path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  dialogOpen(_opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    return Promise.resolve("");
  }
  dialogOpenMultiple(_opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    return Promise.resolve([]);
  }
  dialogSave(_opts: {
    initialPath?: string;
    extensions?: string[];
  }): Promise<string | void> {
    return Promise.resolve("");
  }
  getConfigDir(): Promise<string> {
    return Promise.resolve("configdir");
  }
  getCurrentDir(): Promise<string> {
    return Promise.resolve("currentdir");
  }
  joinPath(items: string[]): string {
    return items.join("/");
  }

  watchInit(_path: string): Promise<void> {
    return Promise.resolve();
  }

  onWatchEvent(_handler: () => void | Promise<void>): void {}
}
