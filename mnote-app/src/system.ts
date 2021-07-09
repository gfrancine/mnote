import { SystemInteropModule } from "mnote-core";
import { invoke } from "@tauri-apps/api/tauri";

export class System implements SystemInteropModule {
  USES_CMD: boolean = false;

  async init() {
    this.USES_CMD = await invoke("is_mac");
    return this;
  }
}
