import { Mnote } from "..";
import {
  Settings,
  SettingsInput,
  SettingsInputIndex,
  SettingsSubcategory,
  SettingsValue,
} from "./types";
import { FSModule } from "./fs";
import { LogModule } from "./log";
import { Emitter } from "mnote-util/emitter";
import { DataDirModule } from "./datadir";
import { set, del } from "mnote-util/immutable";

// the file is only read once at initialization. as long as the
// app is running state is kept here and persisted based on the
// data in this module

export class SettingsModule {
  private fs: FSModule;
  private datadir: DataDirModule;
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
    this.datadir = app.modules.datadir;
    this.log = app.modules.log;

    this.settingsName = app.options.appSettingsFileName || this.settingsName;
  }

  async init() {
    this.settingsPath = this.fs.joinPath([
      await this.datadir.getPath(),
      this.settingsName,
    ]);

    try {
      const contents = await this.fs.readTextFile(this.settingsPath);
      const maybeSettings = JSON.parse(contents);
      this.log.info(
        "valid settings?",
        maybeSettings,
        this.isValidSettings(maybeSettings)
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
    this.log.info("Persist settings to path", this.settingsPath, this.settings);

    await this.fs.writeTextFile(
      this.settingsPath,
      JSON.stringify(this.settings)
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
    return this.persistSettings().then(() =>
      this.events.emit("change", this.settings)
    );
  }

  async getKeyWithDefault<T extends SettingsValue>(
    key: string,
    default_: T,
    isValid: (value: SettingsValue) => boolean /* value is T */
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
    return this.persistSettings().then(() =>
      this.events.emit("change", this.settings)
    );
  }

  resetSettings(): Promise<void> {
    this.settings = this.defaultSettings();
    return this.persistSettings().then(() =>
      this.events.emit("change", this.settings)
    );
  }

  // inputs
  // the settings module only collects the input data assuming that an editor
  // will pick it up and use it
  // registering is immutable because the settings editor will be written in React
  // todo: find an immutable library

  getInputsIndex = () => this.inputsIndex;
  getSubcategories = () => this.subcategories;

  registerInput(input: SettingsInput) {
    const subcategory = this.subcategories[input.subcategory];
    if (!subcategory) {
      throw new Error(`Cannot find subcategory "${input.subcategory}"`);
    }

    const subcategoryInfo =
      this.inputsIndex[subcategory.category][input.subcategory];

    this.inputsIndex = set(
      this.inputsIndex,
      subcategory.category,
      set(
        this.inputsIndex[subcategory.category],
        input.subcategory,
        set(
          subcategoryInfo,
          "inputs",
          set(subcategoryInfo.inputs, input.key, input)
        )
      )
    );

    this.events.emit("inputIndexChanged", this.inputsIndex);
  }

  unregisterInput(input: { key: string; subcategory: string }) {
    const subcategory = this.subcategories[input.subcategory];
    if (!subcategory) return;

    const subcategoryInfo =
      this.inputsIndex[subcategory.category][input.subcategory];

    this.inputsIndex = set(
      this.inputsIndex,
      subcategory.category,
      set(
        this.inputsIndex[subcategory.category],
        input.subcategory,
        set(subcategoryInfo, "inputs", del(subcategoryInfo.inputs, input.key))
      )
    );

    this.events.emit("inputIndexChanged", this.inputsIndex);
  }

  registerSubcategory(subcategory: SettingsSubcategory) {
    if (this.inputsIndex[subcategory.category][subcategory.key]) return;

    this.inputsIndex = set(
      this.inputsIndex,
      subcategory.category,
      set(this.inputsIndex[subcategory.category], subcategory.key, {
        subcategory,
        inputs: {},
      })
    );

    this.subcategories = set(this.subcategories, subcategory.key, subcategory);

    this.events.emit("inputIndexChanged", this.inputsIndex);
  }

  unregisterSubcategory(key: string) {
    const category = this.inputsIndex.core[key] ? "core" : "extensions";
    const subcategoryInfo = this.inputsIndex[category][key];
    if (!subcategoryInfo) return;

    this.subcategories = del(this.subcategories, key);
    this.inputsIndex = set(
      this.inputsIndex,
      category,
      del(this.inputsIndex[category], key)
    );
  }
}
