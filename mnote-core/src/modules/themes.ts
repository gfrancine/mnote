import { Mnote } from "../common/types";
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

  // events: Emitter<{}> = new Emitter();

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;

    this.settings.events.on("change", () => {
      this.updateTheme();
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      async () => {
        const theme = await this.getSettingsValue();
        if (theme !== "system") return;
        this.updateSystemTheme();
      },
    );

    this.settings.registerInput("enum", {
      title: "Theme",
      key: "theme",
      category: "Appearance",
    }, {
      default: "system",
      getItems: () => ["system", ...Object.keys(this.themes)],
    });
  }

  async init() {
    await this.updateTheme();
    return this;
  }

  protected async updateTheme() {
    let theme = await this.getSettingsValue();
    if (!this.hasTheme(theme)) theme = "system";
    console.log("theme updated:", theme);
    if (theme === "system") {
      this.updateSystemTheme();
    } else {
      this.updateWithRegisteredTheme(theme);
    }
  }

  private updateSystemTheme() {
    const perfersDark =
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (perfersDark) {
      this.updateWithRegisteredTheme("dark");
    } else {
      this.updateWithRegisteredTheme("light");
    }
  }

  protected updateWithRegisteredTheme(theme: string) {
    if (!this.themes[theme]) theme = "light";
    const colors = this.themes[theme];
    for (const k of Object.keys(colors)) {
      setVar(k, colors[k]);
    }
  }

  getSettingsValue() {
    return this.settings.getKeyWithDefault(
      "theme",
      "system",
      (v) => typeof v === "string" && this.hasTheme(v),
    );
  }

  hasTheme(name: string) {
    return name === "system" || this.themes[name] !== undefined;
  }
}
