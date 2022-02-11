import { Mnote } from "..";
import { LogModule } from "./log";
const Mousetrap = require("mousetrap");

// https://craig.is/killing/mice#api.stopCallback
Mousetrap.prototype.stopCallback = () => {
  // if the element has the class "mousetrap" then no need to stop
  // if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
  //   return false;
  // }
  // stop for input, select, and textarea
  // return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
  return false;
};

export class InputModule {
  private log: LogModule;

  constructor(app: Mnote) {
    this.log = app.modules.log;
  }

  registerShortcut(
    combinations: string[],
    callback: (e: KeyboardEvent) => void | Promise<void>,
    event?: "keyup" | "keydown"
  ) {
    this.log.info("input: bind combinations", combinations);
    Mousetrap.bind(combinations, callback, event);
  }

  unregisterShortcut(
    combinations: string[],
    callback: (e: KeyboardEvent) => void | Promise<void>,
    event?: "keyup" | "keydown"
  ) {
    this.log.info("input: unbind combinations", combinations);
    Mousetrap.unbind(combinations, callback, event);
  }
}
