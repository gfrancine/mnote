import { Mnote /* , Module */ } from "../common/types";
import hotkeys, { KeyHandler } from "../common/hotkeys";

export class InputModule /* implements Module */ {
  constructor(_app: Mnote) {}

  hotkey(hotkey: string, handler: KeyHandler) {
    return hotkeys(hotkey, handler);
  }
}
