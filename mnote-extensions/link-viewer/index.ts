import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { linkIcon } from "./icons";
import "./link-viewer.scss";

// from https://codepen.io/ScarpMetal/pen/JrKNNY
function extractFromWebloc(text: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  return xmlDoc.getElementsByTagName("string")[0].childNodes[0].nodeValue || "";
}

const urlFileRegex = /\[InternetShortcut\]\s+URL=(.*)/;

function extractFromInternetShortcut(text: string) {
  const match = text.match(urlFileRegex);
  if (!match || !match[1]) return "";
  return match[1].trim();
}

class LinkViewer implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  constructor(app: Mnote) {
    this.app = app;

    this.fs = app.modules.fs as FSModule;

    this.element = el("div").class("link-viewer-editor").element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    containter.appendChild(this.element);

    const { path, name } = ctx.getDocument();
    if (!path) return;

    const contents = await this.fs.readTextFile(path);
    const extension = this.fs.getPathExtension(path).toLowerCase();
    const link =
      extension === "webloc"
        ? extractFromWebloc(contents)
        : extractFromInternetShortcut(contents);

    this.element.innerHTML = `
    <div>
      <p style="margin-top:0">This link leads to <b>${link}</b>.</p>
      <a class="open-button" target="_blank" href="${link}">
        Open in Default Browser
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height:1em; width:1em;">
            <path d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48M336 64h112v112M224 288L440 72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" stroke="currentColor" />
          </svg>
        </span>
      </a>
    </div>
    `;

    return Promise.resolve();
  }

  cleanup() {
    if (this.container) this.container.removeChild(this.element);
  }

  save(_path: string) {
    return Promise.resolve();
  }
}

// source: https://www.w3schools.com/html/html_images.asp
const IMAGE_EXTENSIONS = new Set(
  "png,jpeg,jpg,jfif,pjpeg,pjp,gif,svg,ico,cur,apng".split(",")
);

// extension

export class LinkViewerExtension implements Extension {
  private app?: Mnote;

  startup(app: Mnote) {
    this.app = app;

    const matchesExtension = (path: string) => {
      const extension = app.modules.fs.getPathExtension(path).toLowerCase();
      return extension === "webloc" || extension === "url";
    };

    app.modules.fileicons.registerIcon({
      kind: "link",
      factory: linkIcon,
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "link-viewer",
      name: "Link Viewer",
      canOpenPath: matchesExtension,
      createNewEditor: () => new LinkViewer(app),
      registeredIconKind: "link",
      disableSaveAs: true,
      hideFromNewMenu: true,
    });
  }

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("link-viewer");
    this.app.modules.fileicons.unregisterIcon("link");
  }
}
