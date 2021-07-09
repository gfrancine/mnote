import { FileItemWithChildren, FsInteropModule } from "../../mnote";

export class FS implements FsInteropModule {
  writeTextFile(path: string, contents: string): Promise<void> {
    return Promise.resolve();
  }
  readTextFile(path: string): Promise<string> {
    return Promise.resolve("lorem ipsum");
  }
  readDir(path: string): Promise<FileItemWithChildren> {
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
          ],
        },
      ],
    } as FileItemWithChildren;

    return Promise.resolve(tree);
  }
  isFile(path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  isDir(path: string): Promise<boolean> {
    return Promise.resolve(true);
  }
  dialogOpen(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    return Promise.resolve("");
  }
  dialogOpenMultiple(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    return Promise.resolve([]);
  }
  dialogSave(opts: {
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

  watchInit(path: string): Promise<void> {
    return Promise.resolve();
  }

  onWatchEvent(handler: () => void | Promise<void>): void {}
}
