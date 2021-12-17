import { Mnote } from "..";
import { LogModule } from "./log";
const Mousetrap = require("mousetrap");

export class InputModule {
  private log: LogModule;

  constructor(app: Mnote) {
    this.log = app.modules.log;
  }

  registerShortcut(
    combinations: string[],
    callback: (e: KeyboardEvent) => void | Promise<void>
  ) {
    this.log.info("input: bind combinations", combinations);
    Mousetrap.bind(combinations, callback);
  }
}
