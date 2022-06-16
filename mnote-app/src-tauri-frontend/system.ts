import {
  SystemAppMenuId,
  SystemAppMenuListener,
  SystemCancelQuitHook,
  SystemInteropModule,
} from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";
import { Event, listen } from "@tauri-apps/api/event";
import { Signal } from "mnote-util/signal";
import { appWindow, getCurrent } from "@tauri-apps/api/window";

export class System
  implements
    Omit<
      SystemInteropModule,
      "getPreferredTheme" | "onPreferredThemeChange" | "offPreferredThemeChange"
    >
{
  private USES_CMD = false;

  private appMenuSignal = new Signal<SystemAppMenuListener>();

  private cancelQuitHooks: SystemCancelQuitHook[] = [];

  async init() {
    this.USES_CMD = await invoke("is_mac");

    await getCurrent().listen("close-requested", async () => {
      let quitCanceled = false;
      const cancel = () => (quitCanceled = true);

      for (const hook of this.cancelQuitHooks) {
        await hook(cancel);
        if (quitCanceled) return;
      }

      await appWindow.close();
    });

    await listen("menu_event", (event: Event<SystemAppMenuId>) => {
      this.appMenuSignal.emit(event.payload);
    });

    return this;
  }

  usesCmd() {
    return this.USES_CMD;
  }

  hookToQuit(hook: SystemCancelQuitHook) {
    this.cancelQuitHooks.push(hook);
  }

  onAppMenuClick(listener: SystemAppMenuListener) {
    this.appMenuSignal.listen(listener);
  }

  offAppMenuClick(listener: SystemAppMenuListener) {
    this.appMenuSignal.unlisten(listener);
  }
}
