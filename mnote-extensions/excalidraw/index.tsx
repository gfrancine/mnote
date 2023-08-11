import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";

import { createRoot, Root } from "react-dom/client";
import React from "react";

import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState as ExcalidrawAppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";

import "./styles.scss";
import { excalidrawIcon } from "./icon";

type ExcalidrawData = {
  type: "excalidraw";
  version: number;
  source: string;
  readonly elements: ExcalidrawElement[];
  appState: ExcalidrawAppState;
  files: BinaryFiles;
};

type EventBus = Emitter<{
  change: (data: ExcalidrawData) => void;
}>;

function Wrapper(props: {
  emitter: EventBus;
  initialData: Partial<ExcalidrawData>;
}) {
  // select only a few elements from the appstate

  const appState = props.initialData.appState;

  const initialData = {
    type: "excalidraw",
    version: props.initialData.version || 2,
    source: props.initialData.source || "Mnote",
    elements: props.initialData.elements,
    appState: {
      theme: appState?.theme,
      gridSize: appState?.gridSize,
      zenModeEnabled: appState?.zenModeEnabled,
      scrollX: appState?.scrollX,
      scrollY: appState?.scrollY,
      zoom: appState?.zoom,
    },
    files: props.initialData.files,
  };

  return (
    <>
      <Excalidraw
        onChange={(elements, appState, files) =>
          props.emitter.emit("change", {
            ...initialData,
            elements,
            appState,
            files,
          } as ExcalidrawData)
        }
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            saveAsImage: false,
          },
        }}
        initialData={initialData}
      />
    </>
  );
}

const makeCallback = (self: ExcalidrawEditor) => (data: ExcalidrawData) => {
  self.data = data;
  self.ctx?.markUnsaved();
};

class ExcalidrawEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  reactRoot: Root;
  container?: HTMLElement;
  ctx?: EditorContext;
  fs: FSModule;
  emitter: EventBus;

  data: Partial<ExcalidrawData> = {};

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.element = el("div").class("excdraw-extension").element;
    this.reactRoot = createRoot(this.element);
    this.emitter = new Emitter();
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    containter.appendChild(this.element);

    this.emitter.on("change", makeCallback(this));

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      const data: ExcalidrawData = JSON.parse(contents);
      this.data = data;
    }

    this.reactRoot.render(
      <Wrapper initialData={this.data} emitter={this.emitter} />
    );
  }

  cleanup() {
    this.container?.removeChild(this.element);
    this.reactRoot.unmount();
  }

  async save(path: string) {
    const extension = this.fs.getPathExtension(path);
    if (extension === "excalidraw") {
      await this.fs.writeTextFile(path, JSON.stringify(this.data));
    } else if (extension === "png") {
      const canvas = await exportToCanvas({
        elements: this.data.elements || [],
        appState: this.data.appState,
        files: this.data.files || null,
      });

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          await this.fs.writeBinaryFile(path, await blob.arrayBuffer());
        },
        "image/png",
        1
      );
    }
  }
}

// extension

export class ExcalidrawExtension implements Extension {
  private app?: Mnote;

  startup(app: Mnote) {
    this.app = app;

    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "excalidraw";

    app.modules.editors.registerEditor({
      kind: "excalidraw",
      name: "Excalidraw",
      canOpenPath: matchesExtension,
      createNewEditor: () => new ExcalidrawEditor(app),
      createNewFileExtension: "excalidraw",
      saveAsFileTypes: [
        {
          name: "Excalidraw",
          extensions: ["excalidraw"],
        },
        {
          name: "Portable Network Graphics",
          extensions: ["png"],
        },
      ],
      registeredIconKind: "excalidraw",
    });

    app.modules.fileicons.registerIcon({
      kind: "excalidraw",
      factory: excalidrawIcon,
      shouldUse: matchesExtension,
    });
  }

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("excalidraw");
    this.app.modules.fileicons.unregisterIcon("excalidraw");
  }
}
