import { Mnote } from "../common/types";
const Mousetrap = require("mousetrap");

export class InputModule {
  constructor(_: Mnote) {}

  registerShortcut(
    combinations: string[],
    callback: (e: KeyboardEvent) => void | Promise<void>,
  ) {
    console.log("input: bind combinations", combinations);
    Mousetrap.bind(combinations, callback);
  }
}
