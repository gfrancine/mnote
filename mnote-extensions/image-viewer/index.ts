import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";

import IvViewer from "iv-viewer";
import "iv-viewer/dist/iv-viewer.css";

import { imageIcon } from "./icon";
import "./image-viewer.scss";

class ImageViewer implements Editor {
  app: Mnote;
  ivViewer: IvViewer;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  // used by src-web
  mockSrc?: string;

  constructor(app: Mnote, mockSrc?: string) {
    this.app = app;

    this.fs = app.modules.fs as FSModule;

    this.element = el("div").class("image-viewer-editor").element;

    this.ivViewer = new IvViewer(this.element, {
      snapView: false,
    });

    this.mockSrc = mockSrc;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    const { path } = ctx.getDocument();

    this.container = containter;
    containter.appendChild(this.element);

    if (path) {
      this.ivViewer.load(this.fs.convertImageSrc(path));
    }

    if (this.mockSrc) {
      this.ivViewer.load(this.mockSrc);
    }

    // the viewer manually calculates its position
    setTimeout(() => this.ivViewer.refresh(), 20);
    ctx.events.on("tabShow", () => this.ivViewer.refresh());

    return Promise.resolve();
  }

  cleanup() {
    if (this.container) {
      this.container.removeChild(this.element);
    }
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

export class ImageViewerExtension implements Extension {
  mockSrc?: string;
  constructor(mockSrc?: string) {
    this.mockSrc = mockSrc;
  }

  startup(app: Mnote) {
    const matchesExtension = (path: string) => {
      const extension = app.modules.fs.getPathExtension(path).toLowerCase();
      return IMAGE_EXTENSIONS.has(extension);
    };

    app.modules.fileicons.registerIcon({
      kind: "image",
      factory: imageIcon,
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "image-viewer",
      name: "Image Viewer",
      canOpenPath: matchesExtension,
      createNewEditor: () => new ImageViewer(app, this.mockSrc),
      registeredIconKind: "image",
      disableSaveAs: true,
      hideFromNewMenu: true,
    });
  }

  cleanup(_app: Mnote) {}
}
