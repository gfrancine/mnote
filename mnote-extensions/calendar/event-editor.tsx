import React, { useEffect, useState } from "react";

export type EventEditorEvent = {
  title: string;
  start: string;
  end: string;
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
      <form
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
        <div className="actions">
          {/* https://stackoverflow.com/a/6617259 */}
          <button type="button" className="cancel" onClick={props.closeEditor}>
            Cancel
          </button>
          <button type="button" className="delete" onClick={removeEvent}>
            Delete
          </button>
          <input value="Save" type="submit" className="save" />
        </div>
      </form>
    </div>
  );
}
