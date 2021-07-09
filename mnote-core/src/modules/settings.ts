import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Settings } from "./types";
import { Emitter } from "../common/emitter";

/** rule to check if a value is a valid settings object */
type ValidSettingsRule = (value: Record<string, unknown>) => boolean;

// the file is only read once at initialization. as long as the
// app is running state is kept here and persisted based on the
// data in this module

export class SettingsModule {
  app: Mnote;
  fs: FSModule;
  logging: LoggingModule;

  SETTINGS_NAME = ".mnotesettings";
  protected settingsPath: string;
  protected settings: Settings = this.defaultSettings();

  // see the bottom of the file
  protected settingsRules: ValidSettingsRule[] = [
    hasValidTheme,
  ];

  events: Emitter<{
    change: (settings: Settings) => void | Promise<void>;
  }> = new Emitter();

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.logging = app.modules.logging as LoggingModule;
  }

  async init() {
    this.settingsPath = this.fs.joinPath([
      await this.fs.getConfigDir(),
      this.SETTINGS_NAME,
    ]);

    try {
      const contents = await this.fs.readTextFile(this.settingsPath);
      const maybeSettings = JSON.parse(contents);
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
    if (typeof value !== "object") return false;
    if (value instanceof Array) return false;
    for (const rule of this.settingsRules) {
      if (!rule(value as Record<string, unknown>)) return false;
    }
    return true;
  }

  getKey<K extends keyof Settings>(key: K): Settings[K] {
    return this.settings[key];
  }

  setKey<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
    this.settings[key] = value;
    return this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  getSettings(): Settings {
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
}

const hasValidTheme: ValidSettingsRule = (value) => {
  return value.theme === undefined || typeof value.theme === "string";
};
