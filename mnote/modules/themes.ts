import OpenColor from "open-color";
import { Mnote } from "../common/types";
import { SettingsModule } from "./settings";

function setVar(key: string, value: string) {
  document.documentElement.style.setProperty("--mnote-" + key, value);
}

export class ThemesModule {
  app: Mnote;
  settings: SettingsModule;

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;
  }

  async init() {
    const settings = this.settings.getSettings();
    if (settings.theme) {
      this.updateTheme(settings.theme);
    } else {
      await this.setTheme(lightTheme);
    }
  }

  protected updateTheme(theme: Record<string, string>) {
    for (const k in theme) {
      setVar(k, theme[k]);
    }
  }

  async setTheme(theme: Record<string, string>) {
    await this.settings.setKey("theme", { ...theme });
    this.updateTheme(theme);
  }
}

const gray = OpenColor.gray;

const lightTheme = {
  "font-main": "Lato",
  "font-monospace": "Fira Mono",

  "fg-main": gray[9],
  "fg-secondary": gray[7],
  "fg-dim": gray[5],

  "bg-main": "#fff",
  "bg-secondary": gray[1],
  "bg-dim": gray[3],

  "shadow": "0px 2px 5px " + gray[3],

  "border-main": gray[3],
  "border-dim": gray[2],

  "sidebar-bg-main": gray[1],
  "sidebar-bg-hover": gray[3],
  "sidebar-fg-main": gray[9],

  "btn-main-fg": gray[9], // buttons, assuming background is bg-main
  "btn-main-fg-hover": gray[9],
  "btn-main-bg": gray[2],
  "btn-main-bg-hover": gray[3],

  "btn-emphasis-fg": "#fff",
  "btn-emphasis-fg-hover": "#fff",
  "btn-emphasis-bg": gray[6],
  "btn-emphasis-bg-hover": gray[7],
};
