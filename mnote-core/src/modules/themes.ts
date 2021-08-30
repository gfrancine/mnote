import { Mnote } from "..";
import { SettingsModule } from "./settings";
import { dark, light } from "../components/colors";
import { ThemeInfo } from "./types";
import { LogModule } from "./log";

// colors are declared at bottom

// variables are in an "mnote" namespace (--mnote-<key>)
function setVar(key: string, value: string) {
  document.documentElement.style.setProperty("--mnote-" + key, value);
}

// themes used to be loaded from plain tables, but it doesn't
// work nicely when new keys are added / values are adjusted

// themes module, binds the registry with the rest of the app

export class ThemesModule {
  private settings: SettingsModule;
  private log: LogModule;
  private themes: Record<string, ThemeInfo> = {
    dark: {
      name: "Dark",
      colors: dark,
    },
    light: {
      name: "Light",
      colors: light,
    },
  };

  // events: Emitter<{}> = new Emitter();

  constructor(app: Mnote) {
    this.settings = app.modules.settings;
    this.log = app.modules.log;

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      async () => {
        const theme = await this.getSettingsValue();
        if (theme !== "system") return;
        this.updateSystemTheme();
      },
    );

    this.settings.events.on("change", () => {
      this.updateTheme();
    });

    this.settings.registerInput("select", {
      title: "Theme",
      key: "theme",
      category: "Appearance",
    }, {
      default: "system",
      getItems: () => [
        {
          value: "system",
          text: "System",
        },
        ...Object.keys(this.themes).map((key) => ({
          value: key,
          text: this.themes[key].name,
        })),
      ],
    });
  }

  async init() {
    await this.updateTheme();
    return this;
  }

  private async updateTheme() {
    let theme = await this.getSettingsValue();
    if (!this.hasTheme(theme)) theme = "system";
    this.log.info("theme: updateTheme", theme);
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

  private updateWithRegisteredTheme(theme: string) {
    if (!this.themes[theme]) theme = "light";
    const themeInfo = this.themes[theme];
    for (const k of Object.keys(themeInfo.colors)) {
      setVar(k, themeInfo.colors[k]);
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

  registerTheme(key: string, info: ThemeInfo) {
    this.themes[key] = info;
    return this.updateTheme(); // promise
  }
}
