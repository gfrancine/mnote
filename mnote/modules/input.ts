import Mousetrap from "mousetrap";
import { Mnote } from "../common/types";

export class InputModule {
  constructor(_: Mnote) {}

  registerShortcut(
    combinations: string[],
    callback: () => void | Promise<void>,
  ) {
    console.log("input: bind combinations", combinations);
    Mousetrap.bind(combinations, callback);
  }
}
