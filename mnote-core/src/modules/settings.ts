import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Emitter } from "mnote-util/emitter";
import { AppDirModule } from "./appdir";
import {
  constructorMap,
  GeneralOptions,
  InputOptionsMap,
  Inputs,
} from "../common/inputs";

// the file is only read once at initialization. as long as the
// app is running state is kept here and persisted based on the
// data in this module

type Settings = Record<string, unknown>;

// the file name of the settings file
export const SETTINGS_NAME = ".mnotesettings";

export class SettingsModule {
  app: Mnote;
  fs: FSModule;
  appdir: AppDirModule;
  logging: LoggingModule;

  protected settingsPath = ""; // initialized in init()
  protected settings: Settings = this.defaultSettings();

  events: Emitter<{
    change: (settings: Settings) => void | Promise<void>;
  }> = new Emitter();

  inputs: Record<string, Inputs> = {}; // [settings key]: input class

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.appdir = app.modules.appdir as AppDirModule;
    this.logging = app.modules.logging as LoggingModule;
  }

  async init() {
    this.settingsPath = this.fs.joinPath([
      await this.appdir.getPath(),
      SETTINGS_NAME,
    ]);

    try {
      const contents = await this.fs.readTextFile(this.settingsPath);
      const maybeSettings = JSON.parse(contents);
      this.logging.info(
        "valid settings?",
        maybeSettings,
        this.isValidSettings(maybeSettings),
      );
      if (this.isValidSettings(maybeSettings)) {
        this.settings = maybeSettings;
      } else {
        throw null;
      }
    } catch {
      await this.resetSettings();
    }

    return this;
  }

  /** persist to the file */
  protected async persistSettings() {
    this.logging.info(
      "Persist settings to path",
      this.settingsPath,
      this.settings,
    );

    await this.fs.writeTextFile(
      this.settingsPath,
      JSON.stringify(this.settings),
    );
  }

  defaultSettings(): Settings {
    return {};
  }

  isValidSettings(value: unknown): value is Settings {
    if (typeof value !== "object" || value === null) return false;
    if (value instanceof Array) return false;
    return true;
  }

  getKey(key: string): unknown {
    return this.settings[key];
  }

  setKey(key: string, value: unknown): Promise<void> {
    this.settings[key] = value;
    return this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  async getKeyWithDefault<T>(
    key: string,
    default_: T,
    isValid: (value: unknown) => boolean, /* value is T */
  ): Promise<T> {
    const value = this.getKey(key);
    if (isValid(value)) {
      return value as T;
    } else {
      await this.setKey(key, default_);
      return default_;
    }
  }

  getSettings() {
    return this.settings;
  }

  setSettings(settings: Settings): Promise<void> {
    this.settings = settings;
    return this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  resetSettings(): Promise<void> {
    this.settings = this.defaultSettings();
    return this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  // inputs
  // the settings module only collects the input data assuming that an editor
  // will pick it up and use it

  getInputs = () => this.inputs;

  registerInput<T extends keyof InputOptionsMap & keyof typeof constructorMap>(
    type: T,
    generalOpts: GeneralOptions,
    opts: InputOptionsMap[T],
  ) {
    const constructor = constructorMap[type];
    if (!constructor) throw new Error(`Input type ${type} does not exist!`);
    // this is safe but I can't get typescript to resolve it
    // deno-lint-ignore no-explicit-any
    const input = new constructor(generalOpts, opts as any);
    this.inputs[generalOpts.key] = input;
  }

  removeInput(key: string) {
    if (this.inputs[key]) delete this.inputs[key];
  }
}
