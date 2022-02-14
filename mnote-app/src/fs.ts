import {
  DialogFilter,
  FileItemWithChildren,
  FsInteropModule,
  FsReadDirOptions,
  FsWatcherEvents,
} from "mnote-core";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { Event as TauriEvent, listen } from "@tauri-apps/api/event";
import { Emitter } from "mnote-util/emitter";
import * as fs from "@tauri-apps/api/fs";
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
since 1.0.0-rc, tauri only allows scoped file system access.
mnote has scoped access to the $HOME directory, the largest
possible scope. Calls to fs apis become like this:

  fs.readTextFile("Desktop/a.txt", {
    dir: fs.BaseDirectory.Home
  })

using an absolute path or ".." will throw:

  fs.readTextFile("../a.txt")
  fs.readTextFile("/users/me/desktop/a.txt")

this FS module treats $HOME like the root directory. all
conversions between absolute paths and $home paths are handled
within the module
*/

const basedirOpts: fs.FsOptions = {
  dir: fs.BaseDirectory.Home,
};

export class FS implements FsInteropModule {
  protected watcher = new Watcher(); // at the bottom of the file

  protected IS_WINDOWS = false;

  protected lib = posix;

  protected homePath = "";

  async init() {
    this.IS_WINDOWS = await invoke("is_windows");

    if (this.IS_WINDOWS) {
      this.lib = win32;
    }

    this.homePath = await pathLib.homeDir();

    return this;
  }

  private fromHome(path: string) {
    // make sure path is absolute
    // relative() calls resolve() internally, which will call
    // process.cwd() when it's not an absolute path
    return this.lib.relative(this.homePath, path);
  }

  writeTextFile(path: string, contents: string): Promise<void> {
    return fs.writeFile(
      {
        path,
        contents,
      },
      basedirOpts
    );
  }

  readTextFile(path: string): Promise<string> {
    return fs.readTextFile(path, basedirOpts);
  }

  writeBinaryFile(path: string, contents: ArrayBuffer): Promise<void> {
    return fs.writeBinaryFile(
      {
        path,
        contents: new Uint8Array(contents),
      },
      basedirOpts
    );
  }

  async readBinaryFile(path: string): Promise<ArrayBuffer> {
    return new Uint8Array(await fs.readBinaryFile(path, basedirOpts));
  }

  async readDir(
    path: string,
    opts?: FsReadDirOptions
  ): Promise<FileItemWithChildren> {
    const entries = await fs.readDir(path, {
      ...opts,
      ...basedirOpts,
    });

    const dirStack: fs.FileEntry[][] = [entries];
    while (dirStack.length > 0) {
      const dir = dirStack.pop() as fs.FileEntry[];
      for (let i = 0; i < dir.length; i++) {
        const entry = dir[i];
        entry.path = this.fromHome(entry.path);
        if (entry.children) dirStack.push(entry.children);
      }
    }

    return {
      path, // no need to call fromHome
      children: entries,
    };
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await fs.renameFile(path, newPath, basedirOpts);
  }

  async renameDir(path: string, newPath: string): Promise<void> {
    await invoke("fs_rename", {
      from: path,
      to: newPath,
    });
  }

  async removeFile(path: string): Promise<void> {
    await fs.removeFile(path, basedirOpts);
  }

  async removeDir(path: string): Promise<void> {
    await fs.removeDir(path, {
      recursive: true,
      ...basedirOpts,
    });
  }

  async createDir(path: string): Promise<void> {
    await fs.createDir(path, basedirOpts);
  }

  async isFile(path: string): Promise<boolean> {
    try {
      await fs.readTextFile(path, basedirOpts);
      return true;
    } catch {
      return false;
    }
  }

  async isDir(path: string): Promise<boolean> {
    try {
      await fs.readDir(path, basedirOpts);
      return true;
    } catch {
      return false;
    }
  }

  async dialogOpen(opts: {
    filters?: DialogFilter[];
    isDirectory: boolean;
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    const result: string | undefined = await invoke("fs_open_dialog", opts);
    if (result === undefined) return;
    const relativeToHome = this.fromHome(result);
    // selecting home dir returns an empty string
    if (relativeToHome.length === 0) return this.homePath;
    return relativeToHome;
  }

  async dialogSave(opts: {
    filters?: DialogFilter[];
    startingDirectory?: string;
    startingFileName?: string;
  }): Promise<string | void> {
    const result: string | undefined = await invoke("fs_save_dialog", opts);
    if (!result) return;
    return this.fromHome(result);
  }

  async getConfigDir(): Promise<string> {
    return this.fromHome(await pathLib.configDir());
  }

  async getCurrentDir(): Promise<string> {
    return this.fromHome(await pathLib.resolve("."));
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
    return this.lib.resolve(
      // make the path absolute, otherwise .resolve()
      // would call process.cwd()
      this.lib.join(this.homePath, basePath),
      relativePath
    );
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
    return this.watcher.watch(this.lib.join(this.homePath, path));
  }

  async unwatch(path: string) {
    await this.watcher.unwatch(this.lib.join(this.homePath, path));
  }

  // onWatchEvent wraps the handler so it adapts the
  // paths to the relative path
  // Map<original handler, wrapped handler>
  private watcherHandlerMap = new Map();

  onWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    const wrapped = ((path, targetPath) => {
      if (path) path = this.fromHome(path);
      if (targetPath) targetPath = this.fromHome(targetPath);
      return handler(path, targetPath);
    }) as FsWatcherEvents[K];

    this.watcherHandlerMap.set(handler, wrapped);

    this.watcher.events.on(event, wrapped);
  }

  offWatchEvent<K extends keyof FsWatcherEvents>(
    event: K,
    handler: FsWatcherEvents[K]
  ) {
    const wrapped = this.watcherHandlerMap.get(handler);
    this.watcherHandlerMap.delete(handler);
    this.watcher.events.off(event, wrapped);
  }
}
