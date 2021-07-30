import { Mnote } from "../common/types";
import { Emitter } from "mnote-util/emitter";
import { SettingsModule } from "./settings";
import { dark, light } from "../components/colors";

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
  themes: Record<string, Record<string, string>> = {
    dark,
    light,
  };

  events: Emitter<{
    register: (name: string) => void | Promise<void>;
  }> = new Emitter();

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;

    this.settings.events.on("change", () => {
      this.init();
    });

    this.events.on("register", () => {
      this.init();
    });
  }

  // load from settings
  async init() {
    const theme = await this.settings.getKeyWithDefault(
      "theme",
      "light",
      (v) => typeof v === "string" && this.hasTheme(v),
    );

    this.rawSetTheme(theme);
  }

  protected rawSetTheme(theme: string) {
    if (!this.hasTheme(theme)) theme = "light";
    const colors = this.themes[theme];
    for (const k of Object.keys(colors)) {
      setVar(k, colors[k]);
    }
  }

  /** set the theme and persist */
  async setTheme(theme: string) {
    if (!this.hasTheme(theme)) theme = "light";
    await this.settings.setKey("theme", theme);
    this.rawSetTheme(theme);
  }

  registerTheme(name: string, colors: Record<string, string>) {
    this.themes[name] = colors;
    this.events.emit("register", name);
    return this;
  }

  hasTheme(name: string) {
    return this.themes[name] !== undefined;
  }
}
