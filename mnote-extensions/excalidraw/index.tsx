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
import { render } from "react-dom";
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
  elements?: ExcalidrawElement[];
  appState?: ExcalidrawAppState;
};

type EventBus = Emitter<{
  change: (data: ExcalidrawData) => void;
}>;

function Wrapper(
  { emitter, initialData }: { emitter: EventBus; initialData: ExcalidrawData },
) {
  return <>
    <Excalidraw
      onChange={(data: ExcalidrawData) => emitter.emit("change", data)}
      initialData={initialData}
    />
  </>;
}

class ExcalidrawEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  emitter: EventBus = new Emitter();

  data: ExcalidrawData = {};

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("excdraw-extension")
      .element;

    // hook to event bus here

    this.emitter.on("change", (data) => {
      this.data = data;
    });
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.container = containter;
    containter.appendChild(this.element);
    render(
      <Wrapper initialData={this.data} emitter={this.emitter} />,
      this.element,
    );
  }

  async load(path: string) {
    const contents = await this.fs.readTextFile(path);
    const data: ExcalidrawData = JSON.parse(contents);
    this.data = data;

    render(<Wrapper initialData={data} emitter={this.emitter} />, this.element);
  }

  cleanup() {
    this.container.removeChild(this.element);
    render(null, this.element);
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
    });
  }

  cleanup() {}
}
