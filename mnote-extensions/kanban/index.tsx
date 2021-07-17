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
import Board from "react-trello";
import { getPathExtension } from "../../mnote-util/path";

import "./kanban.scss";

// https://github.com/rcdexta/react-trello

// an editor extension contains:
// - the editor
// - the provider
// - the extension itself

type Card = {
  id: string;
  title: string;
  description: string;
  label: string;
  draggable?: boolean;
  metadata?: {
    sha: string;
  };
};

type Lane = {
  id: string;
  title: string;
  label: string;
  cards: Card[];
};

type Board = {
  lanes: Lane[];
};

function Wrapper(props: {
  initialData?: Board;
  onChange?: (newBoard: Board) => void;
}) {
  return <Board
    data={props.initialData || { lanes: [] }}
    onDataChange={props.onChange || (() => {})}
    editable
    draggable
    canAddLanes
    editLaneTitle
  />;
}

function makeCallback(editor: KanbanEditor) {
  return (newBoard: Board) => {
    editor.handleChange(newBoard);
  };
}

class KanbanEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  ctx: EditorContext;

  board: Board = { lanes: [] };

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
    const data: Board = JSON.parse(contents);
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
    delete this.board;
    unmountComponentAtNode(this.element);
    this.container.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, JSON.stringify(this.board));
  }

  handleChange(board: Board) {
    this.board = board;
    this.ctx.updateEdited();
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
}

// extension

export class KanbanExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    (this.app.modules.editors as EditorsModule).registerEditor({
      kind: "Kanban",
      provider: new KanbanEditorProvider(this.app),
    });
  }

  cleanup() {}
}
