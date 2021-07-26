import { MenuItem, Mnote } from "../common/types";
import { EditorsModule } from "../modules/editors";
import { EditorContext, EditorProvider, Extension } from "../modules/types";
import { Editor } from "../modules/types";
import { el } from "mnote-util/elbuilder";
import { MenubarModule, SettingsModule } from "../modules";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

// instead of saving to file, the settings editor will
// invoke the Settings.setSettings module

class SettingsEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  settings: SettingsModule;

  contents = "";

  constructor(app: Mnote) {
    this.app = app;
    this.settings = (app.modules.settings as SettingsModule);
    this.textarea = el("textarea")
      .class("plaintext-textarea")
      .class("mousetrap") // enable shortcuts
      .attr("spellcheck", "false")
      .element as HTMLTextAreaElement;

    this.element = el("div")
      .class("plaintext-editor")
      .children(
        this.textarea,
      )
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    ctx.setDocument({
      name: "Settings",
      path: "donotpromptsaveas",
      saved: true,
    });

    this.textarea.value = JSON.stringify(
      this.settings.getSettings(),
      undefined,
      2,
    );

    this.textarea.addEventListener("input", () => {
      this.contents = this.textarea.value;
      ctx.updateEdited();
    });

    this.container = containter;
    containter.appendChild(this.element);
  }

  load(_path: string) {
    this.textarea.value = JSON.stringify(
      this.settings.getSettings(),
      undefined,
      2,
    );
  }

  cleanup() {
    if (this.container) {
      this.container.removeChild(this.element);
    }
  }

  async save(_path: string) {
    const parsed = JSON.parse(this.contents);
    if (!this.settings.isValidSettings(parsed)) {
      // throw when error so the editor module
      // can catch it with a prompt
      throw new Error("invalid settings");
    }

    await this.settings.setSettings(parsed);
  }
}

// provider

class SettingsEditorProvider implements EditorProvider {
  app: Mnote;
  settings: SettingsModule;

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;
  }

  tryGetEditor(_path: string) {}

  createNewEditor() {
    return new SettingsEditor(this.app);
  }
}

// extension

export class SettingsExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    const openSettings = () => {
      (this.app.modules.editors as EditorsModule).newEditor("Settings");
    };

    (this.app.modules.menubar as MenubarModule).addSectionReducer(() => {
      const button: MenuItem = {
        name: "Settings",
        click: openSettings,
      };

      return [button];
    });

    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "Settings",
      provider: new SettingsEditorProvider(this.app),
      hideFromNewMenu: true,
      disableSaveAs: true,
    });
  }

  cleanup() {}
}
