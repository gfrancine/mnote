import {
  Editor,
  EditorContext,
  Extension,
  FSModule,
  Mnote,
  PromptsModule,
} from "mnote-core";
import { el } from "mnote-util/elbuilder";
import React, { useState } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { getPathExtension } from "mnote-util/path";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import { nanoid } from "nanoid";

import "./big-calendar/styles.scss";
import "./big-calendar/dragAndDrop.scss";
import "./calendar.scss";
import { calendarIcon } from "./icon";

// https://github.com/jquense/react-big-calendar/blob/master/examples/demos/createEventWithNoOverlap.js

const DndCalendar = withDragAndDrop(Calendar);

type Event = {
  id: number;
  title: string;
  allDay: boolean;
  start: Date;
  end: Date;
};

type UnparsedEvent = {
  id: number;
  title: string;
  allDay: boolean;
  start: string;
  end: string;
};

type Data = {
  events: Event[];
  displayDragItemInCell?: boolean;
  dayLayoutAlgorithm?: string;
  draggedEvent?: Event;
  view?: string; // 'month'|'week'|'work_week'|'day'|'agenda'
};

type UnparsedData = {
  events: UnparsedEvent[];
};

function serializeData(data: Data) {
  const events = data.events.map((event) => ({
    ...event,
    start: event.start.toJSON(),
    end: event.end.toJSON(),
  }));

  return JSON.stringify({
    ...data,
    events,
  });
}

function deserializeData(json: string) {
  const unparsed: UnparsedData = JSON.parse(json);

  const events = unparsed.events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  return {
    ...unparsed,
    events,
  };
}

const localizer = momentLocalizer(moment);

// taken from examples
// todo: tidy this up

function Wrapper(props: {
  initialData: Data;
  onChange: (data: Data) => void;
  prompt: (message: string) => Promise<string | undefined>;
}) {
  const [data, setData] = useState<Data>({
    // defaults
    view: "month",
    //
    ...props.initialData,
    displayDragItemInCell: true,
    dayLayoutAlgorithm: "no-overlap",
  });

  const onDragStart = (event: Event) => {
    const newData = {
      ...data,
      draggedEvent: event,
    };

    setData(newData);
    props.onChange(newData);
  };

  const onNewEvent = async (event: Event) => {
    const title = await props.prompt("New event name");

    // todo: make modal support prompts too
    // prompt module? see catetan

    if (!title) return;

    const idList = data.events.map((a) => a.id);
    const newId = Math.max(0, ...idList) + 1;

    const newEvent = {
      start: event.start as Date,
      end: event.end as Date,
      title: title,
      allDay: false,
      id: newId,
    };

    const newData = {
      ...data,
      events: [...data.events, newEvent],
    };

    setData(newData);
    props.onChange(newData);
  };

  const onMove = (
    { event, start, end }: { event: Event; start: Date; end: Date },
  ) => {
    const { events } = data;

    const nextEvents = events.map((existingEvent) => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });

    const newData = {
      ...data,
      events: nextEvents,
    };

    setData(newData);
    props.onChange(newData);
  };

  const onResize = (
    { event, start, end }: { event: Event; start: Date; end: Date },
  ) => {
    const { events } = data;

    const nextEvents = events.map((existingEvent) => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent;
    });

    const newData = {
      ...data,
      events: nextEvents,
    };

    setData(newData);
    props.onChange(newData);
  };

  const onView = (view: string) => {
    const newData = {
      ...data,
      view,
    };

    setData(newData);
    props.onChange(newData);
  };

  return <DndCalendar
    selectable
    resizable
    draggable
    popup={true}
    onEventDrop={onMove}
    onEventResize={onResize}
    onSelectSlot={onNewEvent}
    onDragStart={onDragStart}
    onView={onView}
    localizer={localizer} // ?
    events={data.events}
    view={data.view}
    defaultView={Views.WEEK}
  />;
}

function makeCallback(editor: CalendarEditor) {
  return (data: Data) => {
    editor.handleChange(data);
  };
}

class CalendarEditor implements Editor {
  app: Mnote;
  element: HTMLElement;
  container?: HTMLElement;
  fs: FSModule;
  prompts: PromptsModule;
  ctx?: EditorContext;

  data: Data = {
    events: [],
  };

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
      const contents = await this.fs.readTextFile(path);
      const data = deserializeData(contents);
      this.data = data;
    }

    this.renderWrapper();
  }

  // DRY
  protected renderWrapper() {
    render(
      <Wrapper
        initialData={this.data}
        onChange={makeCallback(this)}
        prompt={(message) => this.prompts.promptTextInput(message)}
      />,
      this.element,
    );
  }

  handleChange(data: Data) {
    this.data = { events: data.events, view: data.view };
    this.ctx?.updateEdited();
  }

  cleanup() {
    unmountComponentAtNode(this.element);
    this.container?.removeChild(this.element);
  }

  async save(path: string) {
    await this.fs.writeTextFile(path, serializeData(this.data));
  }
}

// extension

export class CalendarExtension implements Extension {
  startup(app: Mnote) {
    const matchesExtension = (path: string) =>
      getPathExtension(path) === "mncalendar";

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
