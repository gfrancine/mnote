import { FileItemWithChildren, FsInteropModule } from "mnote-core";

export class FS implements FsInteropModule {
  writeTextFile(_path: string, _contents: string): Promise<void> {
    return Promise.resolve();
  }
  readTextFile(_path: string): Promise<string> {
    return Promise.resolve("lorem ipsum");
  }
  readDir(_path: string): Promise<FileItemWithChildren> {
    const tree = {
      path: "dir-a",
      children: [
        { path: "file-b" },
        { path: "file-c" },
        {
          path: "dir-d",
          children: [
            { path: "file-e" },
            { path: "file-f" },
            { path: "file-g.md" },
          ],
        },
      ],
    } as FileItemWithChildren;

    return Promise.resolve(tree);
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
