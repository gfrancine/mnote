import {
  SystemAppMenuId,
  SystemAppMenuListener,
  SystemCancelQuitHook,
  SystemInteropModule,
} from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";
import { Event, listen } from "@tauri-apps/api/event";
import { Signal } from "../../mnote-util/signal";
// import { appWindow, getCurrent } from "@tauri-apps/api/window";

export class System implements SystemInteropModule {
  private USES_CMD = false;

  private appMenuSignal = new Signal<SystemAppMenuListener>();

  private cancelQuitHooks: SystemCancelQuitHook[] = [];

  async init() {
    this.USES_CMD = await invoke("is_mac");

    // run before quit hooks
    /* await getCurrent().listen("close-requested", async () => {
      // https://github.com/tauri-apps/tauri/commit/8157a68af1d94de1b90a14aa44139bb123b3436b#

      let quitCanceled = false;
      const cancel = () => quitCanceled = true;

      for (const hook of this.cancelQuitHooks) {
        await hook(cancel);
        if (quitCanceled) return;
      }

      await appWindow.close();
    }); */

    await listen("menu_event", (event: Event<SystemAppMenuId>) => {
      console.log("rust menu event", event);
      this.appMenuSignal.emit(event.payload);
    });

    return this;
  }

  usesCmd() {
    return this.USES_CMD;
  }

  hookToQuit(hook: SystemCancelQuitHook) {
    console.log("hooked to quit", hook);
    this.cancelQuitHooks.push(hook);
  }

  onAppMenuClick(listener: SystemAppMenuListener) {
    this.appMenuSignal.listen(listener);
  }

  offAppMenuClick(listener: SystemAppMenuListener) {
    this.appMenuSignal.unlisten(listener);
  }
}
