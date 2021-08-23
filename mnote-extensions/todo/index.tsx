import {
  Editor,
  EditorContext,
  EditorProvider,
  Extension,
  FSModule,
  Mnote,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { getPathExtension } from "mnote-util/path";

import "./todo.scss";
import Todo, { TodoData } from "./todo";
import { todoIcon } from "./icon";

type TodoParsedFile = {
  version: number;
  // deno-lint-ignore no-explicit-any
  data: any;
};

type TodoFile = {
  version: number;
  data: Partial<TodoData>;
};

function migrate(value: TodoParsedFile): TodoFile {
  switch (value.version) {
    case 1:
      return value;
    default:
      return value;
  }
}

function Wrapper(props: {
  initialData?: Partial<TodoData>;
  onChange?: (newData: TodoData) => void;
}) {
  return <Todo
    initialState={props.initialData || {}}
    onChange={props.onChange}
  />;
}

function makeCallback(editor: TodoEditor) {
  return (newtodo: TodoData) => {
    editor.handleChange(newtodo);
  };
}

class TodoEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  ctx?: EditorContext;

  todo: TodoFile = {
    version: 1,
    data: {},
  };

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.element = el("div")
      .class("todo-extension")
      .element;
  }

  startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);
    render(
      <Wrapper
        initialData={this.todo.data}
        onChange={makeCallback(this)}
      />,
      this.element,
    );
  }

  async load(path: string) {
    unmountComponentAtNode(this.element);
    const contents = await this.fs.readTextFile(path);
    const file: TodoFile = JSON.parse(contents);
    const migrated = migrate(file);
    this.todo = migrated;
    render(
      <Wrapper
        initialData={this.todo.data}
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
    await this.fs.writeTextFile(path, JSON.stringify(this.todo));
  }

  handleChange(todo: TodoData) {
    this.todo.data = todo;
    this.ctx?.updateEdited();
  }
}

// provider

class TodoEditorProvider implements EditorProvider {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  tryGetEditor(path: string) {
    if (getPathExtension(path) === "mntodo") {
      return new TodoEditor(this.app);
    }
  }
  createNewEditor() {
    return new TodoEditor(this.app);
  }
}

// extension

export class TodoExtension implements Extension {
  app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  startup() {
    this.app.modules.editors.registerEditor({
      kind: "Todo",
      provider: new TodoEditorProvider(this.app),
      registeredIconKind: "todo",
      saveAsFileTypes: [{
        name: "Mnote Todo",
        extensions: ["mntodo"],
      }],
    });

    this.app.modules.fileicons.registerIcon({
      kind: "todo",
      factory: todoIcon,
      shouldUse: (path) => getPathExtension(path) === "mntodo",
    });
  }

  cleanup() {}
}
