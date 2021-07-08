import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { LoggingModule } from "./logging";
import { Settings } from "./types";
import { Emitter } from "../common/emitter";

export class SettingsModule {
  app: Mnote;
  fs: FSModule;
  logging: LoggingModule;

  protected SETTINGS_NAME = ".mnotesettings";
  protected settingsPath: string;
  protected settings: Settings = this.defaultSettings();

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
    return this.setSettings;
  }

  setSettings(settings: Settings) {
    this.settings = settings;
    this.persistSettings()
      .then(() => this.events.emit("change", this.settings));
  }
}
