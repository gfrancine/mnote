import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { imageIcon } from "./icon";
import "./image-viewer.scss";
import panzoom, { PanZoom } from "panzoom";

class ImageViewer implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  image: HTMLImageElement;
  fs: FSModule;
  panzoom: PanZoom;

  // used by src-web
  mockSrc?: string;

  constructor(app: Mnote, mockSrc?: string) {
    this.app = app;

    this.fs = app.modules.fs as FSModule;

    this.image = el("img").class("image-viewer-image")
      .element as HTMLImageElement;

    this.element = el("div")
      .class("image-viewer-editor")
      .children(this.image).element;

    this.mockSrc = mockSrc;

    this.panzoom = panzoom(this.image, {
      smoothScroll: false,
    });
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    const { path } = ctx.getDocument();

    this.container = containter;
    containter.appendChild(this.element);

    console.log(ctx.getDocument());

    if (path) {
      this.image.src = this.fs.convertImageSrc(path);
    }

    if (this.mockSrc) {
      this.image.src = this.mockSrc;
    }

    console.log(this.mockSrc, this.image);

    // the viewer manually calculates its position
    // setTimeout(() => this.ivViewer.refresh(), 20);
    // ctx.events.on("tabShow", () => this.ivViewer.refresh());

    return Promise.resolve();
  }

  cleanup() {
    if (this.container) {
      this.container.removeChild(this.element);
    }

    this.panzoom.dispose();
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
  app?: Mnote;

  constructor(mockSrc?: string) {
    this.mockSrc = mockSrc;
  }

  startup(app: Mnote) {
    this.app = app;

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

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("image-viewer");
    this.app.modules.fileicons.unregisterIcon("image");
  }
}
