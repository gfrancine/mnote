import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";

import { imageIcon } from "./icon";
import "./image-viewer.scss";

class ImageViewer implements Editor {
  app: Mnote;
  imageElement: HTMLImageElement;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;

  // used by src-web
  mockSrc?: string;

  constructor(app: Mnote, mockSrc?: string) {
    this.app = app;

    this.fs = (app.modules.fs as FSModule);

    this.imageElement = el("img")
      .class("image")
      .element as HTMLImageElement;

    this.element = el("div")
      .class("image-viewer-editor")
      .children(
        this.imageElement,
      )
      .element;

    this.mockSrc = mockSrc;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    const { path } = ctx.getDocument();
    if (path) {
      this.imageElement.src = this.fs.convertImageSrc(path);
    }

    if (this.mockSrc) {
      this.imageElement.src = this.mockSrc;
    }

    this.container = containter;
    containter.appendChild(this.element);

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
  "png,jpeg,jpg,jfif,pjpeg,pjp,gif,svg,ico,cur,apng".split(","),
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
