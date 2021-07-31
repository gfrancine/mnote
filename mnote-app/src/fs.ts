import {
  DialogFileType,
  FileItemWithChildren,
  FsInteropModule,
} from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { Emitter } from "mnote-util/emitter";
import * as fs from "@tauri-apps/api/fs";
import * as path from "@tauri-apps/api/path";
import * as dialog from "@tauri-apps/api/dialog";

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  protected USES_BACKSLASH = false;

  async init() {
    this.USES_BACKSLASH = await invoke("is_windows");
    console.log("uses backslash?", this.USES_BACKSLASH);
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

  async readDir(path: string): Promise<FileItemWithChildren> {
    const entries = await fs.readDir(path, {
      recursive: true,
    });

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

  async dialogOpen(opts: {
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    try {
      const filters: dialog.DialogFilter[] | undefined = opts.extensions
        ? [{ name: "extensions", extensions: opts.extensions }]
        : undefined;

      const result = await dialog.open({
        directory: opts.directory,
        multiple: false,
        filters,
      }) as string;

      return result;
    } catch {
      return;
    }
  }

  dialogSave(opts: {
    fileTypes?: DialogFileType[];
  }): Promise<string | void> {
    try {
      return dialog.save({
        filters: opts.fileTypes,
      });
    } catch {
      return Promise.resolve();
    }
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
      this.USES_BACKSLASH ? "\\" : "/",
      items,
    );
  }

  async watchInit(path: string) {
    if (this.watcher.isInitialized()) {
      throw new Error("watcher is alerady initialized");
    }
    await this.watcher.init(path);
  }

  onWatchEvent(handler: () => void | Promise<void>) {
    this.watcher.onEvent(handler);
  }
}

export class Watcher {
  protected initialized = false;
  protected emitter = new Emitter<{
    event: () => void | Promise<void>;
  }>();

  isInitialized() {
    return this.initialized;
  }

  async init(path: string) {
    this.initialized = true;
    await listen("watcher_event", () => {
      this.emitter.emit("event");
    });
    invoke("watcher_init", { path }); // do NOT await
  }

  onEvent(handler: () => void | Promise<void>) {
    this.emitter.on("event", handler);
  }
}
