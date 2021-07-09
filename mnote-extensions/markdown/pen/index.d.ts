// https://github.com/sofish/pen

interface Options {
  editor: Element; // {DOM Element} [required]
  class?: string; // {String} class of the editor,
  debug?: boolean; // {Boolean} false by default
  textarea?: string; // fallback for old browsers
  list?: string[]; // editor menu list
  linksInNewWindow?: boolean; // open hyperlinks in a new windows/tab
}

declare class Pen {
  constructor(options: Options);

  toMd(): string;

  setContent(hmtl: string): void;

  destroy(): Pen;

  on(event: "change", callback: () => void);
}

export default Pen;
