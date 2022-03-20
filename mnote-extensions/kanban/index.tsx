import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Board, { defaultValue, KanbanState } from "mnote-deps/kanban";

import "./kanban.scss";
import { kanbanIcon } from "./icon";

function Wrapper(props: {
  initialData?: KanbanState;
  onChange?: (newBoard: KanbanState) => void;
}) {
  return (
    <Board
      initialState={props.initialData || defaultValue()}
      onChange={props.onChange}
    />
  );
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
    this.fs = app.modules.fs;
    this.element = el("div").class("kanban-extension").element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      const data: KanbanState = JSON.parse(contents);
      this.board = data;
    }

    render(
      <Wrapper initialData={this.board} onChange={makeCallback(this)} />,
      this.element
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
    this.ctx?.markUnsaved();
  }
}

// extension

export class KanbanExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "mnkanban";

    app.modules.editors.registerEditor({
      kind: "kanban",
      name: "Kanban",
      canOpenPath: matchesExtension,
      createNewEditor: () => new KanbanEditor(app),
      registeredIconKind: "kanban",
      createNewFileExtension: "mnkanban",
      saveAsFileTypes: [
        {
          name: "Mnote Kanban",
          extensions: ["mnkanban"],
        },
      ],
    });

    app.modules.fileicons.registerIcon({
      kind: "kanban",
      factory: kanbanIcon,
      shouldUse: matchesExtension,
    });
  }

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */ 
  cleanup(_app: Mnote) {}
}
