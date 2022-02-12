import {
  Editor,
  EditorContext,
  Extension,
  FSModule,
  Mnote,
  PopupsModule,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./calendar.scss";
import { calendarIcon } from "./icon";
import { nanoid } from "nanoid";

// https://github.com/fullcalendar/fullcalendar-example-projects/blob/master/react-typescript/src/DemoApp.tsx
// https://github.com/fullcalendar/fullcalendar-example-projects/blob/master/typescript/src/main.ts
// https://fullcalendar.io/
// https://fullcalendar.io/docs

type DeserializedEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

type Data = {
  view: string;
  events: DeserializedEvent[];
};

class CalendarEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  popups: PopupsModule;
  ctx?: EditorContext;

  calendar?: Calendar;
  view = "dayGridMonth";

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs as FSModule;
    this.popups = app.modules.popups as PopupsModule;
    this.element = el("div").class("calendar-extension").element;
  }

  async startup(containter: HTMLElement, ctx: EditorContext) {
    this.ctx = ctx;
    this.container = containter;
    this.container.appendChild(this.element);

    let initialData: Data | undefined;

    const { path } = ctx.getDocument();
    if (path) {
      const contents = await this.fs.readTextFile(path);
      initialData = JSON.parse(contents);
    }

    const cal = new Calendar(this.element, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      selectable: true,
      editable: true,
      dayMaxEvents: true,
      unselectAuto: true,
      nowIndicator: true,
      headerToolbar: {
        left: "title",
        center: "prev,next",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      initialView: initialData?.view || this.view,
      initialEvents: initialData?.events,
      viewDidMount: (arg) => {
        const didChange = arg.view.type !== this.view;
        this.view = arg.view.type;
        if (didChange) this.handleChange();
      },
    });

    // https://fullcalendar.io/docs/date-clicking-selecting
    // https://fullcalendar.io/docs/event-model

    cal.on("select", (arg) => {
      this.app.modules.popups
        .promptTextInput("Create a new event")
        .then((title) => {
          if (!title) return;
          cal.addEvent({
            title,
            id: nanoid(),
            start: arg.startStr,
            end: arg.endStr,
            allDay: arg.allDay,
          });
        })
        .finally(() => cal.unselect());
    });

    cal.on("eventClick", (arg) => {
      arg.event.remove();
    });

    cal.on("eventsSet", this.handleChange);

    this.render();
    ctx.events.on("tabShow", this.render);
    ctx.events.on("tabMount", this.render);

    this.calendar = cal;
  }

  handleChange = () => {
    this.ctx?.markUnsaved();
  };

  render = () => this.calendar?.render();

  serializeData() {
    if (!this.calendar) {
      throw new Error(
        "Attempted to serialize data before calendar initialized"
      );
    }

    const events = this.calendar.getEvents().map((eventApi) => ({
      id: eventApi.id,
      title: eventApi.title,
      start: eventApi.start,
      end: eventApi.end,
      allDay: eventApi.allDay,
    }));

    return {
      view: this.view,
      events: events,
    };
  }

  cleanup() {
    this.container?.removeChild(this.element);
    this.ctx?.events.off("tabShow", this.render);
    this.ctx?.events.off("tabMount", this.render);
    this.calendar?.destroy();
    delete this.calendar;
  }

  async save(path: string) {
    const contents = JSON.stringify(this.serializeData());
    await this.fs.writeTextFile(path, contents);
  }
}

// extension

export class CalendarExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      app.modules.fs.getPathExtension(path) === "mncalendar";

    app.modules.editors.registerEditor({
      kind: "calendar",
      name: "Calendar",
      canOpenPath: matchesExtension,
      createNewEditor: () => new CalendarEditor(app),
      registeredIconKind: "calendar",
      createNewFileExtension: "mncalendar",
      saveAsFileTypes: [
        {
          name: "Mnote Calendar",
          extensions: ["mncalendar"],
        },
      ],
    });

    app.modules.fileicons.registerIcon({
      kind: "calendar",
      factory: calendarIcon,
      shouldUse: matchesExtension,
    });
  }

  cleanup(_app: Mnote) {}
}
