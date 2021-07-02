// wrapper for user input, such as saving
// uses both keyboards and some items in the menubar

import { Mnote /* , Module */ } from "../common/types";
import { Emitter } from "../common/emitter";
import { InputModule } from "./input";

type Actions = {
  save: () => void;
  saveAs: () => void;
  undo: () => void;
  redo: () => void;
};

export class ActionsModule /* implements Module */ {
  app: Mnote;
  input: InputModule;
  actions = new Emitter<Actions>();

  constructor(app: Mnote) {
    this.app = app;
    this.input = (this.app.modules.input as InputModule);
  }
}
