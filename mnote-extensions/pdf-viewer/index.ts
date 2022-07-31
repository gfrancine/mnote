import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { pdfIcon } from "./icons";
import "./pdf-viewer.scss";

class PdfViewer implements Editor {
  private element: HTMLElement;
  private iframe: HTMLIFrameElement;
  private container?: HTMLElement;
  private fs: FSModule;
  private mockSrc?: string;

  constructor(app: Mnote, mockSrc?: string) {
    this.mockSrc = mockSrc;
    this.fs = app.modules.fs as FSModule;
    this.iframe = el("iframe").class("pdf-viewer-iframe")
      .element as HTMLIFrameElement;
    this.element = el("div").class("pdf-viewer").children(this.iframe).element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    containter.appendChild(this.element);

    const { path } = ctx.getDocument();
    if (this.mockSrc) {
      this.iframe.src = this.mockSrc;
    } else if (path) {
      this.iframe.src = this.fs.convertAssetSrc(path);
    }
  }

  cleanup() {
    this.iframe.src = "";
    if (this.container) this.container.removeChild(this.element);
  }

  save(_path: string) {
    return Promise.resolve();
  }
}

// extension

export class PdfViewerExtension implements Extension {
  private app?: Mnote;
  private mockSrc?: string;

  constructor(mockSrc?: string) {
    this.mockSrc = mockSrc;
  }

  startup(app: Mnote) {
    this.app = app;

    const matchesExtension = (path: string) => {
      const extension = app.modules.fs.getPathExtension(path).toLowerCase();
      return extension === "pdf";
    };

    app.modules.fileicons.registerIcon({
      kind: "pdf",
      factory: pdfIcon,
      shouldUse: matchesExtension,
    });

    app.modules.editors.registerEditor({
      kind: "pdf-viewer",
      name: "PDF Viewer",
      canOpenPath: matchesExtension,
      createNewEditor: () => new PdfViewer(app, this.mockSrc),
      registeredIconKind: "pdf",
      disableSaveAs: true,
      hideFromNewMenu: true,
    });
  }

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("pdf-viewer");
    this.app.modules.fileicons.unregisterIcon("pdf");
  }
}
