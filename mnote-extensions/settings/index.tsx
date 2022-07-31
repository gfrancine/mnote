import {
  Editor,
  EditorContext,
  Extension,
  LogModule,
  Mnote,
  Settings,
  SettingsModule,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { createRoot, Root } from "react-dom/client";
import React from "react";
import { SettingsEditor as ReactSettingsEditor } from "./editor";
import { settingsIcon } from "./icon";
import "./settings.scss";
import { debounce } from "debounce";

// instead of saving to file, the settings editor will
// invoke the Settings.setSettings module

// the path used by its editor to identify a currently open editor
// and whether to use the settings icon on a path
export const SETTINGS_ALIAS_PATH = "Settings *.[]:;|,_";

class SettingsEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  reactRoot: Root;
  editorMain: HTMLElement;
  viewToggle: HTMLElement;
  textarea: HTMLTextAreaElement;
  container?: HTMLElement;
  settings: SettingsModule;
  log: LogModule;

  ctx?: EditorContext;
  value: Settings;
  view: "editor" | "raw" = "editor";

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings;
    this.log = app.modules.log;

    this.viewToggle = el("div")
      .class("settings-view-toggle")
      .inner("Raw view")
      .on("click", () => {
        this.setView(this.view === "editor" ? "raw" : "editor");
      }).element;

    this.textarea = el("textarea")
      .class("settings-textarea")
      .class("mousetrap") // enable shortcuts
      .attr("spellcheck", "false").element as HTMLTextAreaElement;

    this.editorMain = el("div").class("settings-main").element;

    this.reactRoot = createRoot(this.editorMain);

    this.element = el("div")
      .class("settings-editor")
      .children(this.textarea, this.editorMain, this.viewToggle).element;

    this.value = this.settings.getSettings();

    this.renderEditor();
    this.updateView();
  }

  markUnsaved = () => this.ctx?.markUnsaved();

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    ctx.setDocument({
      name: "Settings",
      path: SETTINGS_ALIAS_PATH,
      saved: true,
    });

    this.textarea.value = JSON.stringify(this.value, undefined, 2);

    this.textarea.addEventListener(
      "input",
      debounce(() => {
        let parsed: Settings;

        try {
          parsed = JSON.parse(this.textarea.value);
        } catch {
          return;
        }

        if (!this.settings.isValidSettings(parsed)) {
          this.log.warn(
            "settings extension: invalid raw input settings",
            parsed
          );
          return;
        }

        this.value = parsed;
        ctx.markUnsaved();
      }, 200)
    );

    this.container = containter;
    containter.appendChild(this.element);
  }

  renderEditor = () => {
    this.reactRoot.render(
      <ReactSettingsEditor
        inputIndex={this.settings.getInputsIndex()}
        subcategories={this.settings.getSubcategories()}
        initialSettings={this.value}
        placeholder="Choose a category from the sidebar on the right."
        saveSettings={() => {
          this.ctx?.save();
        }}
        onChange={(value) => {
          this.value = value;
          this.ctx?.markUnsaved();
          this.textarea.value = JSON.stringify(this.value, undefined, 2);
        }}
      />
    );
  };

  setView = (view: "editor" | "raw") => {
    this.view = view;
    this.updateView();
  };

  updateView = () => {
    if (this.view === "editor") {
      this.editorMain.style.display = "flex";
      this.textarea.style.display = "none";
    } else {
      this.editorMain.style.display = "none";
      this.textarea.style.display = "block";
    }
  };

  cleanup() {
    this.reactRoot.unmount();
    if (this.container) {
      this.container.removeChild(this.element);
    }
  }

  async save(_path: string) {
    await this.settings.setSettings(this.value);
  }
}

// extension

export class SettingsExtension implements Extension {
  private app?: Mnote;

  startup(app: Mnote) {
    this.app = app;

    const isSettingsPath = (path: string) => path === SETTINGS_ALIAS_PATH;

    const openSettings = () => {
      app.modules.editors.open(SETTINGS_ALIAS_PATH);
    };

    app.modules.menubar.addSectionReducer({
      id: "openSettingsEditor",
      reducer: () => {
        const button = {
          name: "Settings",
          click: openSettings,
        };
        return [button];
      },
    });

    app.modules.fileicons.registerIcon({
      kind: "settings",
      factory: settingsIcon,
      shouldUse: isSettingsPath,
    });

    app.modules.editors.registerEditor({
      kind: "settings",
      name: "Settings",
      canOpenPath: isSettingsPath,
      createNewEditor: () => new SettingsEditor(app),
      hideFromNewMenu: true,
      disableSaveAs: true,
      disableAutosave: true, // we're not saving to file directly
      registeredIconKind: "settings",
    });
  }

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("settings");
    this.app.modules.fileicons.unregisterIcon("settings");
    this.app.modules.menubar.removeSectionReducer("openSettingsEditor");
  }
}
