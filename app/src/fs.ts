import { FileItem, FsInteropModule } from "../../mnote";
import * as fs from "@tauri-apps/api/fs";
import * as dialog from "@tauri-apps/api/dialog";

export class FS implements FsInteropModule {
  async writeTextFile(path: string, contents: string): Promise<void> {
    return fs.writeFile({
      path,
      contents,
    });
  }

  async readTextFile(path: string): Promise<string> {
    return fs.readTextFile(path);
  }

  async readDir(path: string): Promise<FileItem> {
    const entries = await fs.readDir(path);
    return {
      path,
      children: entries,
    };
  }

  async isFile(path: string): Promise<boolean> {
    try {
      fs.readTextFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async isDir(path: string): Promise<boolean> {
    try {
      fs.readDir(path);
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
}
