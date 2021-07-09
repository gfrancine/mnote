import OpenColor from "open-color";
import { Mnote } from "../common/types";
import { ThemeName } from "./types";
import { SettingsModule } from "./settings";

// colors are declared at bottom

// variables are in an "mnote" namespace (--mnote-<key>)
function setVar(key: string, value: string) {
  document.documentElement.style.setProperty("--mnote-" + key, value);
}

// themes used to be loaded from plain tables, but it doesn't
// work nicely when new keys are added / values are adjusted

export class ThemesModule {
  app: Mnote;
  settings: SettingsModule;

  themes: Record<ThemeName, Record<string, string>> = {
    light: lightTheme,
    dark: darkTheme,
  };

  constructor(app: Mnote) {
    this.app = app;
    this.settings = app.modules.settings as SettingsModule;
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

  protected rawSetTheme(theme: ThemeName) {
    const colors = this.themes[theme];
    for (const k in colors) {
      setVar(k, colors[k]);
    }
  }

  /** set the theme and persist */
  async setTheme(theme: ThemeName) {
    await this.settings.setKey("theme", theme);
    this.rawSetTheme(theme);
  }
}

// themes

// note: see the reference
// https://github.com/yeun/open-color

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
  "overlay": gray[7] + "32",

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

// dark theme from my UI prototype

const darkTheme = {
  "font-main": "Lato",
  "font-monospace": "Fira Mono",

  "fg-main": "#B0B6BB",
  "fg-secondary": "#767E85",
  "fg-dim": "#656A70",

  "bg-main": "#2B2D2E",
  "bg-secondary": "#242627",
  "bg-dim": "#5A6164",

  "shadow": "0px 2px 5px " + "#111",
  "overlay": "#11111132",

  "border-main": "#5A6164",
  "border-dim": "#5A6164",

  "sidebar-bg-main": "#242627",
  "sidebar-bg-hover": "#2B2D2E",
  "sidebar-fg-main": "#B0B6BB",

  "btn-main-fg": "#B0B6BB", // buttons, assuming background is bg-main
  "btn-main-fg-hover": "#B0B6BB",
  "btn-main-bg": "#5A6164",
  "btn-main-bg-hover": "#656A70",

  "btn-emphasis-fg": "#2B2D2E",
  "btn-emphasis-fg-hover": "#2B2D2E",
  "btn-emphasis-bg": "#767E85",
  "btn-emphasis-bg-hover": "#5A6164",
};

/* oc dark theme

const darkTheme = {
  "font-main": "Lato",
  "font-monospace": "Fira Mono",

  "fg-main": gray[2],
  "fg-secondary": gray[4],
  "fg-dim": gray[5],

  "bg-main": gray[8],
  "bg-secondary": gray[9],
  "bg-dim": gray[3],

  "shadow": "0px 2px 5px " + "#111",
  "overlay": "#11111132",

  "border-main": gray[9],
  "border-dim": gray[9],

  "sidebar-bg-main": gray[9],
  "sidebar-bg-hover": gray[7],
  "sidebar-fg-main": gray[4],

  "btn-main-fg": gray[2], // buttons, assuming background is bg-main
  "btn-main-fg-hover": gray[2],
  "btn-main-bg": gray[7],
  "btn-main-bg-hover": gray[6],

  "btn-emphasis-fg": gray[9],
  "btn-emphasis-fg-hover": gray[9],
  "btn-emphasis-bg": gray[3],
  "btn-emphasis-bg-hover": gray[4],
}; */
