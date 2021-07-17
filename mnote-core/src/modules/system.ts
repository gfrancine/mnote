import { SystemInteropModule } from "../common/types";

export class SystemModule implements SystemInteropModule {
  protected system?: SystemInteropModule;

  USES_CMD: boolean;

  constructor(system?: SystemInteropModule) {
    this.system = system;
    this.USES_CMD = system ? system.USES_CMD : false; // todo: can we use a browser api?
  }

  // todo: move some fs items to system?
}
