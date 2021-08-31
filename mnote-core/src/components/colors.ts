import OpenColor from "open-color";
// note: see the reference
// https://github.com/yeun/open-color

const gray = OpenColor.gray;

export const light = {
  "font-main": "Open Sans",
  "font-monospace": "Fira Mono",

  "fg-main": gray[9],
  "fg-secondary": gray[6],
  "fg-dim": gray[5],

  "bg-main": "#fff",
  "bg-secondary": gray[1],
  "bg-dim": gray[3],

  "shadow": "0px 2px 5px " + gray[3],
  "overlay-bg": gray[7] + "32",

  "border-main": gray[3],
  "border-dim": gray[2],

  "sidebar-bg-main": gray[1],
  "sidebar-fg-main": gray[9],

  "sidebar-item-icon": gray[6],
  "sidebar-item-hover-bg": gray[2],
  "sidebar-item-hover-fg": gray[9],
  "sidebar-item-hover-icon": gray[6],
  "sidebar-item-focused-bg": gray[3],
  "sidebar-item-focused-fg": gray[9],
  "sidebar-item-focused-icon": gray[6],

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

export const dark = {
  "font-main": "Open Sans",
  "font-monospace": "Fira Mono",

  "fg-main": "#B0B6BB",
  "fg-secondary": "#767E85",
  "fg-dim": "#656A70",

  "bg-main": "#2B2D2E",
  "bg-secondary": "#242627",
  "bg-dim": "#404345",

  "shadow": "0px 2px 5px " + "#111",
  "overlay-bg": "#11111132",

  "border-main": "#111",
  "border-dim": "#222",

  "sidebar-bg-main": "#242627",
  "sidebar-bg-hover": "#2B2D2E",
  "sidebar-fg-main": "#B0B6BB",
  "sidebar-fg-secondary": "#767E85",

  "sidebar-item-icon": "#767E85",
  "sidebar-item-hover-bg": "#2B2D2E",
  "sidebar-item-hover-fg": "#B0B6BB",
  "sidebar-item-hover-icon": "#767E85",
  "sidebar-item-focused-bg": "#303233",
  "sidebar-item-focused-fg": "#B0B6BB",
  "sidebar-item-focused-icon": "#767E85",

  "btn-main-fg": "#B0B6BB", // buttons, assuming background is bg-main
  "btn-main-fg-hover": "#B0B6BB",
  "btn-main-bg": "#5A6164",
  "btn-main-bg-hover": "#656A70",

  "btn-emphasis-fg": "#2B2D2E",
  "btn-emphasis-fg-hover": "#2B2D2E",
  "btn-emphasis-bg": "#B0B6BB",
  "btn-emphasis-bg-hover": "#767E85",
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
