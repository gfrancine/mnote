import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Settings } from "./types";
import { Emitter } from "../common/emitter";

type ValidSettingsRule = (value: Record<string, unknown>) => boolean;

export class SettingsModule {
  app: Mnote;
  fs: FSModule;
  logging: LoggingModule;

  protected SETTINGS_NAME = ".mnotesettings";
  protected settingsPath: string;
  protected settings: Settings = this.defaultSettings();

  // rules to check if a value is a valid settings
  // object. see the bottom of the file
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
      this.settings = this.defaultSettings();
      await this.persistSettings();
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

  setKey<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.settings[key] = value;
    this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }

  getSettings(): Settings {
    return this.settings;
  }

  setSettings(settings: Settings) {
    this.settings = settings;
    this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }
}

// settings validators

const hasValidTheme: ValidSettingsRule = (value) => {
  const theme = value.theme;

  if (typeof theme === "undefined") return true;
  if (typeof theme !== "object") return false;
  if (theme instanceof Array) return false;

  for (const k in theme) {
    if (typeof theme[k] !== "string") return false;
  }

  return true;
};
