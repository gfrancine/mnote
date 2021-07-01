import { Mnote } from "../common/types";
import { EditorsModule } from "../modules/editors";
import { EditorProvider, Extension } from "../modules/types";
import { Editor } from "../modules/types";

class PlaintextEditor implements Editor {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup(containter: HTMLElement) {
    containter.innerHTML = "dfsdfasdf";
  }

  load(path: string) {}

  cleanup() {}

  save() {}

  saveAs() {}

  undo() {}

  redo() {}

  isSaved() {
    return true;
  }
}

class PlaintextEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(_path: string) {
    return new PlaintextEditor(this.app);
  }
  createNewEditor() {
    return new PlaintextEditor(this.app);
  }
}

export class PlaintextExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor(
      "plaintext",
      new PlaintextEditorProvider(this.app),
    );
  }

  cleanup() {}
}
