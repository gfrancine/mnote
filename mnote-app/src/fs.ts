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

// https://tauri.studio/en/docs/api/js/modules/fs

type RustWatcherPayload = {
  kind: "write" | "remove" | "rename";
  path?: string; // conversion from PathBuf is an Option
  targetPath?: string;
};

export class Watcher {
  protected initialized = false;
  events = new Emitter<FsWatcherEvents>();

  isInitialized() {
    return this.initialized;
  }

  async init(path: string) {
    this.initialized = true;

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

    invoke("watcher_init", { path }); // do NOT await
  }
}

const ANY_SLASH = /[\\/]/;

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  protected IS_WINDOWS = false;

  async init() {
    this.IS_WINDOWS = await invoke("is_windows");
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

  joinPath(items: string[]) {
    const join = (delimiter: string, items_: string[]) => {
      let final = "";
      items.forEach((item, i) => {
        if (item.charAt(0) === delimiter) {
          item = item.slice(1);
        }

        const length = item.length;
        if (item.charAt(length - 1) === delimiter) {
          item = item.slice(0, length - 1);
        }

        final += item + (i === items_.length - 1 ? "" : delimiter);
      });

      return final;
    };

    return join(
      this.IS_WINDOWS ? "\\" : "/",
      items,
    );
  }

  splitPath(path: string) {
    const delimiter = this.IS_WINDOWS ? ANY_SLASH : "/";
    return path.split(delimiter);
  }

  async watchInit(path: string) {
    if (this.watcher.isInitialized()) {
      throw new Error("watcher is alerady initialized");
    }
    await this.watcher.init(path);
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
