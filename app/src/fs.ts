import { FileItem, FileItemWithChildren, FsInteropModule } from "../../mnote";
import { invoke } from "@tauri-apps/api/tauri";
import { Emitter } from "../../mnote/common/emitter";
import * as fs from "@tauri-apps/api/fs";
import * as path from "@tauri-apps/api/path";
import * as dialog from "@tauri-apps/api/dialog";

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  async writeTextFile(path: string, contents: string): Promise<void> {
    return fs.writeFile({
      path,
      contents,
    });
  }

  async readTextFile(path: string): Promise<string> {
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
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string | void> {
    try {
      const filters: dialog.DialogFilter[] = opts.extensions
        ? [{ name: "extensions", extensions: opts.extensions }]
        : undefined;

      const result = await dialog.open({
        defaultPath: opts.initialPath,
        directory: opts.directory,
        multiple: false,
        filters,
      }) as string;

      return result;
    } catch {
      return;
    }
  }

  async dialogOpenMultiple(opts: {
    initialPath?: string;
    extensions?: string[];
    directory: boolean;
  }): Promise<string[] | void> {
    try {
      const filters: dialog.DialogFilter[] = opts.extensions
        ? [{ name: "extensions", extensions: opts.extensions }]
        : undefined;

      const result = await dialog.open({
        defaultPath: opts.initialPath,
        directory: opts.directory,
        multiple: true,
        filters,
      });

      if (typeof result === "string") {
        return [result];
      } else {
        return result;
      }
    } catch {
      return;
    }
  }

  async dialogSave(opts: {
    initialPath?: string;
    extensions?: string[];
  }): Promise<string | void> {
    try {
      const filters: dialog.DialogFilter[] = opts.extensions
        ? [{ name: "extensions", extensions: opts.extensions }]
        : undefined;

      return dialog.save({
        defaultPath: opts.initialPath,
        filters,
      });
    } catch {
      return;
    }
  }

  getConfigDir(): Promise<string> {
    return path.configDir();
  }

  getCurrentDir(): Promise<string> {
    return path.currentDir();
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

// the plan is to use the notify crate and propagate events
// through the app object but what's in the docs isn't released
// when the channel api is stable, this will be moved to rust

type WatcherDidChangeResult = {
  didChange: boolean;
  newFiles: Record<string, true>;
};

export class Watcher {
  protected INTERVAL = 1000;

  protected intervalID: NodeJS.Timer;
  protected lastFiles: Record<string, true> = {};
  protected emitter = new Emitter<{
    event: () => void | Promise<void>;
  }>();

  protected initialized: boolean = false;

  isInitialized() {
    return this.initialized;
  }

  async init(path: string) {
    this.initialized = true;

    const update = () => {
      invoke("dir_did_change", {
        path,
        files: this.lastFiles,
      }).then((result: WatcherDidChangeResult) => {
        this.lastFiles = result.newFiles;
        if (result.didChange) {
          this.emitter.emit("event");
        }
      }).catch((err) => {
        console.log("rust err", err);
        clearInterval(this.intervalID);
      });
    };

    this.intervalID = setInterval(update, this.INTERVAL);
  }

  onEvent(handler: () => void | Promise<void>) {
    this.emitter.on("event", handler);
  }
}
