import { Mnote } from "..";
import { SettingsModule } from "./settings";
import { dark, light } from "./themes-colors";
import { ThemeInfo } from "./types";
import { LogModule } from "./log";
import { createIcon } from "mnote-components/vanilla/icons";
import { SystemModule } from "./system";

export class ThemesModule {
  private app: Mnote;
  private settings: SettingsModule;
  private system: SystemModule;
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
    this.app = app;
    this.settings = app.modules.settings;
    this.system = app.modules.system;
    this.log = app.modules.log;

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", async () => {
        const theme = await this.getSettingsValue();
        if (theme !== "system") return;
        this.updateSystemTheme();
      });

    this.system.onPreferredThemeChange(async () => {
      const theme = await this.getSettingsValue();
      if (theme !== "system") return;
      this.updateSystemTheme();
    });

    this.settings.events.on("change", () => {
      this.updateTheme();
      this.updateFontOverride();
    });

    this.settings.registerSubcategory({
      key: "appearance",
      title: "Appearance",
      category: "core",
      iconFactory: (fillClass, strokeClass) =>
        createIcon("appearance", fillClass, strokeClass),
    });

    this.settings.registerInput({
      type: "select",
      title: "Theme",
      description: "The app theme color",
      key: "core.theme",
      subcategory: "appearance",
      default: "system",
      getItems: () => [
        {
          value: "system",
          text: "Use system theme",
        },
        ...Object.keys(this.themes).map((key) => ({
          value: key,
          text: this.themes[key].name,
        })),
      ],
    });

    this.settings.registerInput({
      type: "string",
      title: "Font override",
      description:
        "Override the app's main font with any installed font," +
        " e.g. with Arial, Times New Roman, etc." +
        " Leave blank to use the theme's default font.",
      key: "core.theme.fontOverride",
      subcategory: "appearance",
      default: "",
    });
  }

  async init() {
    await this.updateTheme();
    await this.updateFontOverride();
    return this;
  }

  private setVar(key: string, value: string) {
    this.app.element.style.setProperty("--mnote-" + key, value);
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
    this.updateWithRegisteredTheme(this.system.getPreferredTheme());
  }

  private updateWithRegisteredTheme(theme: string) {
    if (!this.themes[theme]) theme = "light";
    const themeInfo = this.themes[theme];
    for (const k of Object.keys(themeInfo.colors)) {
      this.setVar(k, themeInfo.colors[k]);
    }
  }

  getSettingsValue() {
    return this.settings.getKeyWithDefault(
      "core.theme",
      "system",
      (v) => typeof v === "string" && this.hasTheme(v)
    );
  }

  async updateFontOverride() {
    const overrideFont = await this.settings.getKeyWithDefault(
      "core.theme.fontOverride",
      "",
      (v) => typeof v === "string"
    );

    if (!overrideFont.trim().length) return;
    this.setVar("main-font", `'${overrideFont}'`);
  }

  hasTheme(name: string) {
    return name === "system" || this.themes[name] !== undefined;
  }

  registerTheme(key: string, info: ThemeInfo) {
    this.themes[key] = info;
    return this.updateTheme(); // promise
  }
}
