import { SystemInteropModule, SystemShortcutHandler } from "../common/types";

export class SystemModule implements SystemInteropModule {
  system?: SystemModule;

  constructor(system: SystemModule) {
    this.system = system;
  }

  async registerShortcut(shortcut: string, handler: SystemShortcutHandler) {
    if (this.system) {
      return this.system.registerShortcut(shortcut, handler);
    }
  }
}
