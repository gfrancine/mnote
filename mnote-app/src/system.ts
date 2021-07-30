import { SystemCancelQuitHook, SystemInteropModule } from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { appWindow, getCurrent } from "@tauri-apps/api/window";

export class System implements SystemInteropModule {
  USES_CMD = false;

  private cancelQuitHooks: SystemCancelQuitHook[] = [];

  async init() {
    this.USES_CMD = await invoke("is_mac");

    // run before quit hooks
    await getCurrent().listen("close-requested", async () => {
      // https://github.com/tauri-apps/tauri/commit/8157a68af1d94de1b90a14aa44139bb123b3436b#
      // apparently even the example doesn;t work V
      /* if (await confirm('Are you sure?')) {
        await appWindow.close()
      } */

      let quitCanceled = false;
      const cancel = () => quitCanceled = true;

      for (const hook of this.cancelQuitHooks) {
        await hook(cancel);
        if (quitCanceled) return;
      }

      await appWindow.close();
    });

    await listen("menu_event", (payload) => {
      console.log("rust menu event", payload);
    });

    return this;
  }

  hookToQuit(hook: SystemCancelQuitHook) {
    console.log("hooked to quit", hook);
    this.cancelQuitHooks.push(hook);
  }
}
