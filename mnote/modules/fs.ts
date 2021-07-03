import { Mnote /* , Module */ } from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

interface FsInteropModule {
  //todo
}

export class FSModule implements FsInteropModule {
  app: Mnote;

  constructor(app: Mnote /* , fs: FsInteropModule */) {
    this.app = app;
  }

  async writeTextFile(path: string, contents: string): Promise<void> {
    //
  }

  async readTextFile(path: string): Promise<string> {
    return "";
  }

  async readDir(path: string): Promise<boolean> {
    return false;
  }

  async fileExists(path: string): Promise<boolean> {
    return false;
  }

  async dirExists(path: string): Promise<boolean> {
    return false;
  }

  async dialogOpen(opts: {
    initialPath?: string;
    directory: boolean;
    multiple: boolean;
  }): Promise<string | void> {
    //
  }

  async dialogSave(opts: {
    initialPath?: string;
    extensions?: string[];
  }): Promise<string | void> {
    //
  }
}
