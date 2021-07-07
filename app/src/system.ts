import { SystemInteropModule, SystemShortcutHandler } from "../../mnote";
import { globalShortcut } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";

export class System implements SystemInteropModule {
  USES_CMD: boolean = false;

  async init() {
    this.USES_CMD = await invoke("is_mac");
    return this;
  }

  async registerShortcut(shortcut: string, handler: SystemShortcutHandler) {
    return globalShortcut.register(shortcut, handler);
  }
}
