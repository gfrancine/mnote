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
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Board, { defaultValue, KanbanState } from "mnote-deps/kanban";
import { getPathExtension } from "mnote-util/path";

import "./kanban.scss";
import { kanbanIcon } from "./icon";

// https://github.com/rcdexta/react-trello

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

function Wrapper(props: {
  initialData?: KanbanState;
  onChange?: (newBoard: KanbanState) => void;
}) {
  return <Board
    initialState={props.initialData || defaultValue()}
    onChange={props.onChange}
  />;
}

function makeCallback(editor: KanbanEditor) {
  return (newBoard: KanbanState) => {
    editor.handleChange(newBoard);
  };
}

class KanbanEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  ctx?: EditorContext;

  board: KanbanState = defaultValue();

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("kanban-extension")
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);
    render(
      <Wrapper
        initialData={this.board}
        onChange={makeCallback(this)}
      />,
      this.element,
    );
  }

  async load(path: string) {
    unmountComponentAtNode(this.element);
    const contents = await this.fs.readTextFile(path);
    const data: KanbanState = JSON.parse(contents);
    this.board = data;
    render(
      <Wrapper
        initialData={this.board}
        onChange={makeCallback(this)}
      />,
      this.element,
    );
  }

  cleanup() {
    unmountComponentAtNode(this.element);
    this.container?.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, JSON.stringify(this.board));
  }

  handleChange(board: KanbanState) {
    this.board = board;
    this.ctx?.updateEdited();
  }
}

// provider

class KanbanEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(path: string) {
    if (getPathExtension(path) === "mnkanban") {
      return new KanbanEditor(this.app);
    }
  }
  createNewEditor() {
    return new KanbanEditor(this.app);
  }

  getRegisteredIconKind = () => "kanban";
}

// extension

export class KanbanExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    this.app.modules.editors.registerEditor({
      kind: "Kanban",
      provider: new KanbanEditorProvider(this.app),
      saveAsFileTypes: [{
        name: "Mnote Kanban",
        extensions: ["mnkanban"],
      }],
    });

    this.app.modules.fileicons.registerIcon({
      kind: "kanban",
      factory: kanbanIcon,
      shouldUse: (path) => getPathExtension(path) === "mnkanban",
    });
  }

  cleanup() {}
}
