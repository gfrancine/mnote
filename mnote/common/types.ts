// common types used by the files
// has no dependencies, except for standalone
// utilities like Emitter

import { Emitter } from "./emitter";

export type Module = unknown;

export type MnoteState = {};

export type Mnote = {
  element: Element;

  state: MnoteState;

  signals: Emitter<{
    stateChange: () => void;
  }>;

  // unlike signals, modules are dynamic because it can
  // be extended by the user. use type casting instead
  modules: Record<string, Module>;

  setState: (state: MnoteState) => void;

  addModule: (name: string, module: Module) => Mnote;
};
