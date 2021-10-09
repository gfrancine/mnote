import { Signal } from "mnote-util/signal";
import {
  SystemAppMenuListener,
  SystemCancelQuitHook,
  SystemInteropModule,
  SystemThemeListener,
} from "../common/types";

export class SystemModule implements SystemInteropModule {
  private system?: Partial<SystemInteropModule>;
  private themeChangedSignal: Signal<SystemThemeListener> = new Signal();

  constructor(system?: Partial<SystemInteropModule>) {
    this.system = system;

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      () => this.themeChangedSignal.emit(this.getPreferredTheme()),
    );
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

  getPreferredTheme() {
    if (this.system?.getPreferredTheme) {
      return this.system.getPreferredTheme();
    }

    const perfersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return perfersDark ? "dark" : "light";
  }

  onPreferredThemeChange(listener: SystemThemeListener) {
    if (this.system?.onPreferredThemeChange) {
      this.system.onPreferredThemeChange(listener);
    } else {
      this.themeChangedSignal.listen(listener);
    }
  }

  offPreferredThemeChange(listener: SystemThemeListener) {
    if (this.system?.offPreferredThemeChange) {
      this.system.offPreferredThemeChange(listener);
    } else {
      this.themeChangedSignal.unlisten(listener);
    }
  }
}
