import {
  Mnote,
  Settings,
  SettingsInputIndex,
  SettingsSubcategory,
  SettingsValue,
} from "..";
import { FSModule } from "./fs";
import { LogModule } from "./log";
import { Emitter } from "mnote-util/emitter";
import { AppDirModule } from "./appdir";
import {
  constructorMap,
  GeneralOptions,
  InputOptionsMap,
} from "./settings-inputs";
import { set } from "mnote-util/immutable";

// the file is only read once at initialization. as long as the
// app is running state is kept here and persisted based on the
// data in this module

export class SettingsModule {
  private fs: FSModule;
  private appdir: AppDirModule;
  private log: LogModule;

  private settingsPath = ""; // initialized in init()
  private settingsName = ".mnotesettings";
  private settings: Settings = this.defaultSettings();

  events: Emitter<{
    change: (settings: Settings) => void | Promise<void>;
    inputIndexChanged: (index: SettingsInputIndex) => void | Promise<void>;
  }> = new Emitter();

  private subcategories: Record<string, SettingsSubcategory> = {};
  private inputsIndex: SettingsInputIndex = {
    core: {},
    extensions: {},
  };

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
    this.appdir = app.modules.appdir;
    this.log = app.modules.log;

    this.settingsName = app.options.appSettingsFileName || this.settingsName;
  }

  async init() {
    this.settingsPath = this.fs.joinPath([
      await this.appdir.getPath(),
      this.settingsName,
    ]);

    try {
      const contents = await this.fs.readTextFile(this.settingsPath);
      const maybeSettings = JSON.parse(contents);
      this.log.info(
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
  private async persistSettings() {
    this.log.info(
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

  getKey(key: string): SettingsValue {
    return this.settings[key];
  }

  setKey(key: string, value: SettingsValue): Promise<void> {
    this.settings[key] = value;
    return this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  async getKeyWithDefault<T extends SettingsValue>(
    key: string,
    default_: T,
    isValid: (value: SettingsValue) => boolean, /* value is T */
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
  // registering is immutable because the settings editor will be written in React
  // todo: find an immutable library

  getInputsIndex = () => this.inputsIndex;
  getSubcategories = () => this.subcategories;

  registerInput<T extends keyof InputOptionsMap & keyof typeof constructorMap>(
    type: T,
    generalOpts: GeneralOptions,
    opts: InputOptionsMap[T],
  ) {
    const constructor = constructorMap[type];
    if (!constructor) throw new Error(`Input type "${type}" does not exist!`);

    // this is safe but I can't get typescript to resolve it
    // deno-lint-ignore no-explicit-any
    const input = new constructor(generalOpts, opts as any);

    const subcategory = this.subcategories[generalOpts.subcategory];
    if (!subcategory) {
      throw new Error(`Cannot find subcategory "${generalOpts.subcategory}"`);
    }

    const subcategoryInfo =
      this.inputsIndex[subcategory.category][generalOpts.subcategory];

    this.inputsIndex = set(
      this.inputsIndex,
      subcategory.category,
      set(
        this.inputsIndex[subcategory.category],
        generalOpts.subcategory,
        set(
          subcategoryInfo,
          "inputs",
          set(subcategoryInfo.inputs, generalOpts.key, input),
        ),
      ),
    );

    this.events.emit("inputIndexChanged", this.inputsIndex);
  }

  registerSubcategory(subcategory: SettingsSubcategory) {
    if (this.inputsIndex[subcategory.category][subcategory.key]) return;

    this.inputsIndex = set(
      this.inputsIndex,
      subcategory.category,
      set(
        this.inputsIndex[subcategory.category],
        subcategory.key,
        {
          subcategory,
          inputs: {},
        },
      ),
    );

    this.subcategories = set(this.subcategories, subcategory.key, subcategory);

    this.events.emit("inputIndexChanged", this.inputsIndex);
  }
}
