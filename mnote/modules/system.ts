import { SystemInteropModule, SystemShortcutHandler } from "../common/types";

export class SystemModule implements SystemInteropModule {
  system?: SystemModule;

  USES_CMD: boolean;

  constructor(system: SystemModule) {
    this.system = system;
    this.USES_CMD = system? system.USES_CMD : false; // todo: can we use a browser api?
  }

  async registerShortcut(shortcut: string, handler: SystemShortcutHandler) {
    if (this.system) {
      return this.system.registerShortcut(shortcut, handler);
    }
  }
}
