import { Mnote } from "../common/types";
import { EditorsModule } from "../modules/editors";
import { Extension } from "../modules/types";
import { Editor } from "../modules/types";

class PlaintextEditor implements Editor {
  startup(path: string, containter: HTMLElement) {
    containter.innerHTML = "dfsdfasdf";
  }

  cleanup() {}

  handleSave() {}
}

function getPlaintextEditor(path: string) {
  return new PlaintextEditor();
}

export class PlaintextExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor(
      "plaintext",
      getPlaintextEditor,
    );
  }

  cleanup() {}
}
