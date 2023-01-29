import { Editor, EditorContext, Extension, FSModule, Mnote } from "mnote-core";
import { el } from "mnote-util/elbuilder";
import React from "react";
import { createRoot, Root } from "react-dom/client";

import "./todo.scss";
import Todo, { TodoData } from "./todo";
import { todoIcon } from "./icon";

type TodoParsedFile = {
  version: number;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any;
};

type TodoFile = {
  version: number;
  data: Partial<TodoData>;
};

const CURRENT_FILE_VERSION = 2;

function migrate(value: TodoParsedFile): TodoFile {
  if (value.version > CURRENT_FILE_VERSION) {
    throw new Error(
      `This version of the file is newer and unsupported. Try updating the app.`
    );
  }

  switch (value.version) {
    case 1:
      // version 2: items order is now { id: string, depth: number } instead of just the id
      value.data.itemsOrder = value.data.itemsOrder?.map((id: string) => ({
        id,
        depth: 0,
      }));
      value.version = 2;
    // falls through
    default:
      return value;
  }
}

function Wrapper(props: {
  initialData?: Partial<TodoData>;
  onChange?: (newData: TodoData) => void;
}) {
  return (
    <Todo initialState={props.initialData || {}} onChange={props.onChange} />
  );
}

function makeCallback(editor: TodoEditor) {
  return (newtodo: TodoData) => {
    editor.handleChange(newtodo);
  };
}

class TodoEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  reactRoot: Root;
  container?: HTMLElement;
  fs: FSModule;
  ctx?: EditorContext;

  todo: TodoFile = {
    version: CURRENT_FILE_VERSION,
    data: {},
  };

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.element = el("div").class("todo-extension").element;
    this.reactRoot = createRoot(this.element);
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      const file: TodoFile = JSON.parse(contents);
      const migrated = migrate(file);
      this.todo = migrated;
    }

    this.reactRoot.render(
      <Wrapper initialData={this.todo.data} onChange={makeCallback(this)} />
    );
  }

  cleanup() {
    this.reactRoot.unmount();
    this.container?.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, JSON.stringify(this.todo));
  }

  handleChange(todo: TodoData) {
    this.todo.data = todo;
    this.ctx?.markUnsaved();
  }
}

// extension

export class TodoExtension implements Extension {
  private app?: Mnote;

  startup(app: Mnote) {
    this.app = app;

    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "mntodo";

    app.modules.editors.registerEditor({
      kind: "todo",
      name: "To-Do List",
      canOpenPath: matchesExtension,
      createNewEditor: () => new TodoEditor(app),
      registeredIconKind: "todo",
      createNewFileExtension: "mntodo",
      saveAsFileTypes: [
        {
          name: "Mnote Todo",
          extensions: ["mntodo"],
        },
      ],
    });

    app.modules.fileicons.registerIcon({
      kind: "todo",
      factory: todoIcon,
      shouldUse: matchesExtension,
    });
  }

  cleanup() {
    if (!this.app) return;
    this.app.modules.editors.unregisterEditor("todo");
    this.app.modules.fileicons.unregisterIcon("todo");
  }
}
