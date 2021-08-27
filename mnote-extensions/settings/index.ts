import {
  Editor,
  EditorContext,
  EditorProvider,
  Extension,
  MenuItem,
  Mnote,
  SettingsModule,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { settingsIcon } from "./icon";
import "./settings.scss";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

// instead of saving to file, the settings editor will
// invoke the Settings.setSettings module

// the path used by its editor to identify a currently open editor
// and whether to use the settings icon on a path
export const SETTINGS_ALIAS_PATH = "Settings *.[]:;|,_";

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
      .class("settings-textarea")
      .class("mousetrap") // enable shortcuts
      .attr("spellcheck", "false")
      .element as HTMLTextAreaElement;

    this.element = el("div")
      .class("settings-editor")
      .children(
        this.textarea,
      )
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    ctx.setDocument({
      name: "Settings",
      path: SETTINGS_ALIAS_PATH,
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

  canOpenPath(path: string) {
    return path === SETTINGS_ALIAS_PATH;
  }

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
      this.app.modules.editors.open(SETTINGS_ALIAS_PATH);
    };

    this.app.modules.menubar.addSectionReducer(() => {
      const button: MenuItem = {
        name: "Settings",
        click: openSettings,
      };
      return [button];
    });

    this.app.modules.fileicons.registerIcon({
      kind: "settings",
      factory: settingsIcon,
      shouldUse: (path) => path === SETTINGS_ALIAS_PATH,
    });

    this.app.modules.editors.registerEditor({
      kind: "Settings",
      provider: new SettingsEditorProvider(this.app),
      hideFromNewMenu: true,
      disableSaveAs: true,
      registeredIconKind: "settings",
    });
  }

  cleanup() {}
}
