import OpenColor from "open-color";
// note: see the reference
// https://github.com/yeun/open-color

const gray = OpenColor.gray;

export const light = {
  "main-font": "Open Sans",
  "main-font-monospace": "Fira Mono",

  "main-fg": gray[9],
  "main-fg-secondary": gray[6],
  "main-fg-dim": gray[5],
  "main-fg-dimmer": gray[3],

  "main-bg": "#fff",
  "main-bg-secondary": gray[1],

  "main-shadow": "0px 2px 5px " + gray[7] + "32",
  "main-overlay-bg": gray[7] + "32",
  "main-scrollbar": gray[3],

  "main-border": gray[4],
  "main-border-dim": gray[2],

  "sidebar-bg": gray[1],
  "sidebar-fg": gray[9],
  "sidebar-scrollbar": gray[3],

  "sidebar-item-icon": gray[6],
  "sidebar-item-hover-bg": gray[2],
  "sidebar-item-hover-fg": gray[9],
  "sidebar-item-hover-icon": gray[6],
  "sidebar-item-focused-bg": gray[3],
  "sidebar-item-focused-fg": gray[9],
  "sidebar-item-focused-icon": gray[6],
  "sidebar-filetree-border": gray[3],

  "btn-main-fg": gray[9], // buttons, assuming background is main-bg
  "btn-main-fg-hover": gray[9],
  "btn-main-bg": gray[2],
  "btn-main-bg-hover": gray[3],

  "btn-emphasis-fg": "#fff",
  "btn-emphasis-hover-fg": "#fff",
  "btn-emphasis-bg": gray[6],
  "btn-emphasis-hover-bg": gray[7],
};

// dark theme from my UI prototype

export const dark = {
  "main-font": "Open Sans",
  "main-font-monospace": "Fira Mono",

  "main-fg": "#B0B6BB",
  "main-fg-secondary": "#767E85",
  "main-fg-dim": "#656c70",
  "main-fg-dimmer": "#404345",

  "main-bg": "#27292a",
  "main-bg-secondary": "#181b1c",

  "main-shadow": "0px 2px 5px " + "#111",
  "main-scrollbar": "#404345",
  "main-overlay-bg": "#11111132",

  "main-border": "#000",
  "main-border-dim": "#222",

  "sidebar-bg": "#181b1c",
  "sidebar-bg-hover": "#27292a",
  "sidebar-fg": "#B0B6BB",
  "sidebar-scrollbar": "#2B2D2E",

  "sidebar-item-icon": "#767E85",
  "sidebar-item-hover-bg": "#27292a",
  "sidebar-item-hover-fg": "#B0B6BB",
  "sidebar-item-hover-icon": "#767E85",
  "sidebar-item-focused-bg": "#2B2D2E",
  "sidebar-item-focused-fg": "#B0B6BB",
  "sidebar-item-focused-icon": "#767E85",
  "sidebar-filetree-border": "#404345",

  "btn-main-fg": "#B0B6BB", // buttons, assuming background is main-bg
  "btn-main-fg-hover": "#B0B6BB",
  "btn-main-bg": "#3F4446",
  "btn-main-bg-hover": "#4A5052",

  "btn-emphasis-fg": "#27292a",
  "btn-emphasis-hover-fg": "#27292a",
  "btn-emphasis-bg": "#B0B6BB",
  "btn-emphasis-hover-bg": "#92989C",
};

/* oc dark theme

const darkTheme = {
  "main-font": "Lato",
  "main-font-monospace": "Fira Mono",

  "main-fg": gray[2],
  "main-fg-secondary": gray[4],
  "main-fg-dim": gray[5],

  "main-bg": gray[8],
  "main-bg-secondary": gray[9],
  "main-fg-dimmer": gray[3],

  "main-shadow": "0px 2px 5px " + "#111",
  "overlay": "#11111132",

  "main-border": gray[9],
  "main-border-dim": gray[9],

  "sidebar-bg": gray[9],
  "sidebar-bg-hover": gray[7],
  "sidebar-fg": gray[4],

  "btn-main-fg": gray[2], // buttons, assuming background is main-bg
  "btn-main-fg-hover": gray[2],
  "btn-main-bg": gray[7],
  "btn-main-bg-hover": gray[6],

  "btn-emphasis-fg": gray[9],
  "btn-emphasis-hover-fg": gray[9],
  "btn-emphasis-bg": gray[3],
  "btn-emphasis-hover-bg": gray[4],
}; */