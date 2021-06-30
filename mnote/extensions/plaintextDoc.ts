import { Mnote } from "../common/types";
import { Extension } from "../modules/types";

export class PlaintextDocExtension implements Extension {
  constructor(app: Mnote) {}

  startup() {}

  cleanup() {}
}
