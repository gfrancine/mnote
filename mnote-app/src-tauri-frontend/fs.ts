import {
  DialogFilter,
  FileItem,
  FileItemWithChildren,
  FsInteropModule,
  FsReadDirOptions,
  FsWatcherEvents,
} from "mnote-core";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from "@tauri-apps/api/event";
import { Emitter } from "mnote-util/emitter";
import * as pathLib from "@tauri-apps/api/path";
import { posix, win32 } from "mnote-deps/path-browser";

// https://tauri.studio/en/docs/api/js/modules/fs

type RustWatcherPayload = {
  kind: keyof Omit<FsWatcherEvents, "event">;
  path?: string; // conversion from PathBuf is an Option
  targetPath?: string;
};

export class Watcher {
  hasInitialized = false;
  events = new Emitter<FsWatcherEvents>();

  async init() {
    this.hasInitialized = true;

    await listen("watcher_event", (event: TauriEvent<RustWatcherPayload>) => {
      this.events.emit("event");

      if (!event.payload.path) return;

      if (event.payload.kind === "rename") {
        if (!event.payload.targetPath) return;
        this.events.emit(
          "rename",
          event.payload.path,
          event.payload.targetPath
        );
      } else {
        this.events.emit(event.payload.kind, event.payload.path);
      }
    });
  }

  watch(path: string) {
    invoke("watch", { path }); // do NOT await
    return Promise.resolve();
  }

  unwatch(path: string) {
    return invoke("unwatch", { path });
  }
}

/*
since 1.0.0-rc, tauri only allows scoped file system access. Calls to fs
apis become like this:

  fs.readTextFile("Desktop/a.txt", {
    dir: fs.BaseDirectory.Home
  })

using an absolute path or ".." will throw:

  fs.readTextFile("../a.txt")
  fs.readTextFile("/users/me/desktop/a.txt")

the app needs access to much more than the home dir, however, for example
example to be able to use UNC paths. This is a custom fs module, which 
also covers more features and allows for custom scoping logic if it's ever
needed.
*/

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  protected IS_WINDOWS = false;

  protected CAN_SHOW_IN_EXPLORER = false;

  protected lib = posix;

  protected dataDirName: string;

  constructor(options: { dataDirName: string }) {
    this.dataDirName = options.dataDirName;
  }

  async init() {
    this.IS_WINDOWS = await invoke("is_windows");
    this.CAN_SHOW_IN_EXPLORER = await invoke("can_show_in_explorer");

    if (this.IS_WINDOWS) {
      this.lib = win32;
    }

    return this;
  }

  writeTextFile(path: string, contents: string): Promise<void> {
    return invoke("fs_write_text_file", {
      path,
      contents,
    });
  }

  readTextFile(path: string): Promise<string> {
    return invoke("fs_read_text_file", { path });
  }

  writeBinaryFile(path: string, contents: ArrayBuffer): Promise<void> {
    return invoke("fs_write_binary_file", { path, contents });
  }

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    return new Uint8Array(await invoke("fs_read_binary_file", { path }));
  }

  async readDir(
    path: string,
    opts?: FsReadDirOptions
  ): Promise<FileItemWithChildren> {
    const entries: FileItem[] = await invoke("fs_read_dir", { path, ...opts });

    const dirStack: FileItem[][] = [entries];
    while (dirStack.length > 0) {
      const dir = dirStack.pop() as FileItem[];
      for (let i = 0; i < dir.length; i++) {
        const entry = dir[i];
        if (entry.children) dirStack.push(entry.children);
      }
    }

    return {
      path, // no need to call fromHome
      children: entries,
    };
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await invoke("fs_rename", { from: path, to: newPath });
  }

  async renameDir(path: string, newPath: string): Promise<void> {
    await invoke("fs_rename", {
      from: path,
      to: newPath,
    });
  }

  async removeFile(path: string): Promise<void> {
    await invoke("fs_delete_file", { path });
  }

  async removeDir(path: string): Promise<void> {
    await invoke("fs_delete_dir", { path });
  }

  async createDir(path: string): Promise<void> {
    await invoke("fs_create_dir", { path });
  }

  async moveToTrash(path: string): Promise<void> {
    await invoke("fs_move_to_trash", { path });
  }

  async isFile(path: string): Promise<boolean> {
    return await invoke("fs_is_file", { path });
  }

  async isDir(path: string): Promise<boolean> {
    return await invoke("fs_is_dir", { path });
  }

  async dialogOpen(opts: {
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    return await invoke("dialog_open", opts);
  }

  async dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    return await invoke("dialog_save", opts);
  }

  async getDataDir(): Promise<string> {
    return pathLib.join(await pathLib.configDir());
  }

  async getCurrentDir(): Promise<string> {
    return await pathLib.resolve(".");
  }

  getPathName(path: string) {
    const info = this.lib.parse(path);
    return info.name + info.ext;
  }

  getPathParent(path: string) {
    return this.lib.dirname(path);
  }

  getPathExtension(path: string) {
    const extension = this.lib.parse(path).ext;
    return extension.length > 0 ? extension.slice(1) : "";
    // parsed.ext has a leading period
  }

  joinPath(fragments: string[]) {
    return this.lib.join(...fragments);
  }

  resolvePath(basePath: string, relativePath: string) {
    return this.lib.resolve(basePath, relativePath);
  }

  ensureSeparatorAtEnd(path: string) {
    if (path.charAt(path.length - 1) !== this.lib.sep) {
      return path + this.lib.sep;
    }
    return path;
  }

  convertImageSrc(src: string) {
    return convertFileSrc(src);
  }

  async watch(path: string) {
    if (!this.watcher.hasInitialized) await this.watcher.init();
    return this.watcher.watch(path);
  }

  async unwatch(path: string) {
    await this.watcher.unwatch(path);
  }

  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    this.watcher.events.on(event, handler);
  }

  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    this.watcher.events.off(event, handler);
  }

  canShowInExplorer() {
    return this.CAN_SHOW_IN_EXPLORER;
  }

  async showInExplorer(path: string) {
    await invoke("show_in_explorer", { path });
  }
}
