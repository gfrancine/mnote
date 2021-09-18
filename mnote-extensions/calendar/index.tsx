import {
  Editor,
  EditorContext,
  Extension,
  FSModule,
  Mnote,
  PromptsModule,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import "./calendar.scss";
import { calendarIcon } from "./icon";

class CalendarEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  prompts: PromptsModule;
  ctx?: EditorContext;

  constructor(app: Mnote) {
    this.app = app;
    this.fs = (app.modules.fs as FSModule);
    this.prompts = app.modules.prompts as PromptsModule;
    this.element = el("div")
      .class("calendar-extension")
      .element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    const { path } = ctx.getDocument();
    if (path) {
      const _contents = await this.fs.readTextFile(path);
    }

    // this.renderWrapper();
  }

  handleChange() {
    this.ctx?.updateEdited();
  }

  cleanup() {
    this.container?.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, "todo");
  }
}

// extension

export class CalendarExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "mncalendar";

    app.modules.editors.registerEditor({
      kind: "Calendar",
      canOpenPath: matchesExtension,
      createNewEditor: () => new CalendarEditor(app),
      registeredIconKind: "calendar",
      saveAsFileTypes: [{
        name: "Mnote Calendar",
        extensions: ["mncalendar"],
      }],
    });

    app.modules.fileicons.registerIcon({
      kind: "calendar",
      factory: calendarIcon,
      shouldUse: matchesExtension,
    });
  }

  cleanup(_app: Mnote) {}
}
