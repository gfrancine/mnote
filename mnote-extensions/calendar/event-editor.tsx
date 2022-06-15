import { Close } from "mnote-components/react/icons-jsx";
import React, { useEffect, useState } from "react";
import { getRangeString } from "./format-date";

export type EventEditorEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

export type EventEditorProps = {
  event?: EventEditorEvent;
  commitChanges: (event: Partial<EventEditorEvent>) => void;
  removeEvent: () => void;
  closeEditor: () => void;
};

export function EventEditor(props: EventEditorProps) {
  if (!props.event) return <></>;

  const [title, setTitle] = useState(props.event.title);

  useEffect(() => {
    if (!props.event) return;
    const { title } = props.event;
    setTitle(title);
  }, [props.event]);

  const commitChanges = () => {
    props.commitChanges({ title });
    props.closeEditor();
  };

  const removeEvent = () => {
    props.removeEvent();
    props.closeEditor();
  };

  return (
    <div className="event-editor">
      <div className="head">
        <h3 className="editor-title">Edit Event</h3>
        <button className="close" onClick={props.closeEditor}>
          <Close strokeClass="stroke" fillClass="fill" />
        </button>
      </div>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          commitChanges();
        }}
      >
        <input
          placeholder="Event title"
          className="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="range">
          {getRangeString({
            start: props.event.start,
            end: props.event.end,
            isAllDay: props.event.allDay,
          })}
        </div>
        <div className="actions">
          {/* https://stackoverflow.com/a/6617259 */}
          <button type="button" className="delete" onClick={removeEvent}>
            Delete
          </button>
          <input value="Save" type="submit" className="save" />
        </div>
      </form>
    </div>
  );
}
