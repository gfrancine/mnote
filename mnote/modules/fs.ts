import { Mnote /* , Module */ } from "../common/types";

// the interop module
// todo: mock
// https://tauri.studio/en/docs/api/js/modules/fs

export class FSModule /* implements Module */ {
  app: Mnote;

  constructor(app: Mnote /* , fs: FsInteropModule */) {
    this.app = app;
  }

  async writeTextFile(path: string, contents: string): Promise<void> {}

  async readTextFile(path: string): Promise<string> {
    return "";
  }
}
