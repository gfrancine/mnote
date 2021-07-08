import { FileItem, FileItemWithChildren, FsInteropModule } from "../../mnote";
import { emit, listen } from "@tauri-apps/api/event";
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

export class Watcher {
  protected initialized: boolean = false;
  protected emitter = new Emitter<{
    event: () => void | Promise<void>;
  }>();

  isInitialized() {
    return this.initialized;
  }

  async init(path: string) {
    this.initialized = true;
    listen("watcher_event", () => {
      this.emitter.emit("event");
    });
    emit("watcher_init", path);
  }

  onEvent(handler: () => void | Promise<void>) {
    this.emitter.on("event", handler);
  }
}
