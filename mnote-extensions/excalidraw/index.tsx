import {
  Editor,
  EditorContext,
  EditorProvider,
  EditorsModule,
  Extension,
  FSModule,
  Mnote,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";
import { getPathExtension } from "mnote-util/path";
import { render, unmountComponentAtNode } from "react-dom";
import React from "react";

import Excalidraw from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState as ExcalidrawAppState } from "@excalidraw/excalidraw/types/types";

import "./styles.scss";

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

type ExcalidrawData = {
  readonly elements?: ExcalidrawElement[];
  appState?: ExcalidrawAppState;
};

type EventBus = Emitter<{
  change: (data: ExcalidrawData) => void;
}>;

function Wrapper(
  props: {
    emitter: EventBus;
    initialData: ExcalidrawData;
  },
) {
  // select only a few elements from the appstate

  const appState = props.initialData.appState;

  const initialData = {
    elements: props.initialData.elements,
    appState: {
      theme: appState?.theme,
      gridSize: appState?.gridSize,
      zenModeEnabled: appState?.zenModeEnabled,
      scrollX: appState?.scrollX,
      scrollY: appState?.scrollY,
      zoom: appState?.zoom,
    },
  };

  return <>
    <Excalidraw
      onChange={(elements, appState) =>
        props.emitter.emit("change", { elements, appState } as ExcalidrawData)}
      UIOptions={{
        canvasActions: {
          changeViewBackgroundColor: false,
          export: false,
          loadScene: false,
          saveToActiveFile: false,
          saveAsImage: true,
        },
      }}
      initialData={initialData}
    />
  </>;
}

const makeCallback = (self: ExcalidrawEditor) =>
  (data: ExcalidrawData) => {
    self.data = data;
    self.ctx?.updateEdited();
  };

class ExcalidrawEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  ctx?: EditorContext;
  fs: FSModule;
  emitter: EventBus;

  data: ExcalidrawData = {};

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("excdraw-extension")
      .element;

    this.emitter = new Emitter();
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    containter.appendChild(this.element);

    this.emitter.on("change", makeCallback(this));

    render(
      <Wrapper initialData={this.data} emitter={this.emitter} />,
      this.element,
    );
  }

  async load(path: string) {
    unmountComponentAtNode(this.element);

    const contents = await this.fs.readTextFile(path);
    const data: ExcalidrawData = JSON.parse(contents);
    this.data = data;

    this.emitter = new Emitter();
    this.emitter.on("change", makeCallback(this));

    render(<Wrapper initialData={data} emitter={this.emitter} />, this.element);
  }

  cleanup() {
    this.container?.removeChild(this.element);
    unmountComponentAtNode(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, JSON.stringify(this.data));
  }
}

// provider

class ExcalidrawEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(path: string) {
    if (getPathExtension(path) === "excalidraw") {
      return new ExcalidrawEditor(this.app);
    }
  }

  createNewEditor() {
    return new ExcalidrawEditor(this.app);
  }
}

// extension

export class ExcalidrawExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "Excalidraw",
      provider: new ExcalidrawEditorProvider(this.app),
      saveAsFileTypes: [{
        name: "Excalidraw",
        extensions: ["excalidraw"],
      }],
    });
  }

  cleanup() {}
}
