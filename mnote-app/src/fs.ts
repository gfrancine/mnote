import {
  DialogFilter,
  FileItemWithChildren,
  FsInteropModule,
  FsReadDirOptions,
  FsWatcherEvents,
} from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from "@tauri-apps/api/event";
import { Emitter } from "mnote-util/emitter";
import * as fs from "@tauri-apps/api/fs";
import * as path from "@tauri-apps/api/path";
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
          event.payload.targetPath,
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

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  protected IS_WINDOWS = false;

  protected lib = posix;

  async init() {
    this.IS_WINDOWS = await invoke("is_windows");

    if (this.IS_WINDOWS) {
      this.lib = win32;
    }

    return this;
  }

  writeTextFile(path: string, contents: string): Promise<void> {
    return fs.writeFile({
      path,
      contents,
    });
  }

  readTextFile(path: string): Promise<string> {
    return fs.readTextFile(path);
  }

  async readDir(
    path: string,
    opts?: FsReadDirOptions,
  ): Promise<FileItemWithChildren> {
    const entries = await fs.readDir(path, opts);
    return {
      path,
      children: entries,
    };
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await fs.renameFile(path, newPath);
  }

  async renameDir(path: string, newPath: string): Promise<void> {
    await invoke("fs_rename", {
      from: path,
      to: newPath,
    });
  }

  async removeFile(path: string): Promise<void> {
    await fs.removeFile(path);
  }

  async removeDir(path: string): Promise<void> {
    await fs.removeDir(path, {
      recursive: true,
    });
  }

  async createDir(path: string): Promise<void> {
    await fs.createDir(path);
  }

  async isFile(path: string): Promise<boolean> {
    try {
      await fs.readTextFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async isDir(path: string): Promise<boolean> {
    try {
      await fs.readDir(path);
      return true;
    } catch {
      return false;
    }
  }

  dialogOpen(opts: {
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    return invoke("fs_open_dialog", opts);
  }

  dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    return invoke("fs_save_dialog", opts);
  }

  getConfigDir(): Promise<string> {
    return path.configDir();
  }

  getCurrentDir(): Promise<string> {
    return path.currentDir();
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

  async watch(path: string) {
    if (!this.watcher.hasInitialized) await this.watcher.init();
    return this.watcher.watch(path);
  }

  async unwatch(path: string) {
    await this.watcher.unwatch(path);
  }

  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ) {
    this.watcher.events.on(event, handler);
  }

  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K],
  ) {
    this.watcher.events.off(event, handler);
  }
}
