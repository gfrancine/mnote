import { Mnote } from "../common/types";
import { ThemeRegistryModule } from "./theme-registry";
import { SettingsModule } from "./settings";

// colors are declared at bottom

// variables are in an "mnote" namespace (--mnote-<key>)
function setVar(key: string, value: string) {
  document.documentElement.style.setProperty("--mnote-" + key, value);
}

// themes used to be loaded from plain tables, but it doesn't
// work nicely when new keys are added / values are adjusted

// themes module, binds the registry with the rest of the app

export class ThemesModule {
  app: Mnote;
  settings: SettingsModule;
  themeRegistry: ThemeRegistryModule;

  constructor(app: Mnote) {
    this.app = app;
    this.themeRegistry = app.modules.themeRegistry as ThemeRegistryModule;
    this.settings = app.modules.settings as SettingsModule;

    this.settings.events.on("change", () => {
      this.init();
    });
  }

  // load from settings
  async init() {
    const settings = this.settings.getSettings();
    if (settings.theme) {
      this.rawSetTheme(settings.theme);
    } else {
      await this.setTheme("dark");
    }
  }

  protected rawSetTheme(theme: string) {
    const colors = this.themeRegistry.themes[theme];
    for (const k in colors) {
      setVar(k, colors[k]);
    }
  }

  /** set the theme and persist */
  async setTheme(theme: string) {
    await this.settings.setKey("theme", theme);
    this.rawSetTheme(theme);
  }
}
