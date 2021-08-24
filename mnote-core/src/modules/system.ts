import { SystemCancelQuitHook, SystemInteropModule } from "../common/types";

export class SystemModule implements SystemInteropModule {
  protected system?: SystemInteropModule;

  constructor(system?: SystemInteropModule) {
    this.system = system;
  }

  // todo: can we use a browser api?
  usesCmd() {
    if (this.system) return this.system.usesCmd();
    return false;
  }

  hookToQuit(hook: SystemCancelQuitHook) {
    if (this.system) {
      this.system.hookToQuit(hook);
    }
  }

  // todo: move some fs items to system?
}
