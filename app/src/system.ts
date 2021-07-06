import { SystemInteropModule, SystemShortcutHandler } from "../../mnote";
import { globalShortcut } from "@tauri-apps/api";

export class System implements SystemInteropModule {
  async registerShortcut(shortcut: string, handler: SystemShortcutHandler) {
    return globalShortcut.register(shortcut, handler);
  }
}
