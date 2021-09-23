import {
  SystemAppMenuListener,
  SystemCancelQuitHook,
  SystemInteropModule,
} from "../common/types";

export class SystemModule implements SystemInteropModule {
  private system?: Partial<SystemInteropModule>;

  constructor(system?: Partial<SystemInteropModule>) {
    this.system = system;
  }

  // todo: can we use a browser api?
  usesCmd() {
    if (this.system?.usesCmd) return this.system.usesCmd();
    return false;
  }

  hookToQuit(hook: SystemCancelQuitHook) {
    this.system?.hookToQuit?.(hook);
  }

  onAppMenuClick(listener: SystemAppMenuListener) {
    this.system?.onAppMenuClick?.(listener);
  }

  offAppMenuClick(listener: SystemAppMenuListener) {
    this.system?.offAppMenuClick?.(listener);
  }
}
