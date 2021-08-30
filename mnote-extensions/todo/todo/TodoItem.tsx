import React, { Fragment, useEffect, useRef, useState } from "react";
import { TodoItemContext, TodoItemData } from "./types";
import TextareaAutosize from "react-textarea-autosize";
import { Checkmark, Close, Trash } from "./icons";

function CheckedBullet({
  value = false,
  onClick,
}: {
  value: boolean;
  onClick?: (value: boolean) => void;
}) {
  return (
    <div
      className="checked-bullet left-element"
      onClick={() => onClick?.(!value)}
    >
      <svg className="bullet" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="black"
          stroke-width="4"
          className="outer"
        />
        {value &&
          <circle cx="50" cy="50" r="38" fill="black" className="inner" />}
      </svg>
    </div>
  );
}

export default function TodoItem(props: {
  index: number;
  key: string;
  item: TodoItemData;
  ctx: TodoItemContext;
  isEditing: boolean;
}) {
  const [draft, setDraft] = useState(props.item.text);
  const [dragoverLocation, setDragoverLocation] = useState<
    null | "above" | "below"
  >(null);

  const saveEdit = () => {
    props.ctx.setItem(props.item.id, {
      ...props.item,
      text: draft,
    });
    props.ctx.setCurrentlyEditing(null);
  };

  const startEditing = () => {
    props.ctx.setCurrentlyEditing(props.item.id);
  };

  const deleteItem = () => {
    props.ctx.deleteItem(props.item.id, props.index);
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!props.isEditing) return;
    ref.current.focus();
  });

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        const thisElement = e.target as HTMLDivElement;
        const rect = thisElement.getBoundingClientRect();
        const offset = rect.y + rect.height / 2;
        if (e.clientY - offset > 0) {
          setDragoverLocation("below");
        } else {
          setDragoverLocation("above");
        }
      }}
      onDragLeave={() => setDragoverLocation(null)}
      onDrop={(e) => {
        const data = e.dataTransfer.getData("todo-index");
        if (!data) return;
        const sourceIndex = parseInt(data, 10);
        setDragoverLocation(null);
        const direction = dragoverLocation === "above" ? -1 : 1;
        props.ctx.moveItemAtIndex(sourceIndex, props.index + direction);
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("todo-index", "" + props.index);
      }}
      onDragEnter={(e) => console.log(e.target)}
      draggable
      className={"todo-item" +
        (dragoverLocation ? " draggedover " + dragoverLocation : "") +
        (props.item.done ? " done" : "")}
    >
      <CheckedBullet
        value={props.item.done}
        onClick={(value) =>
          props.ctx.setItem(props.item.id, {
            ...props.item,
            done: value,
          })}
      />
      <div className={"todo-text-input" + (props.isEditing ? " editing" : "")}>
        <TextareaAutosize
          ref={ref}
          spellCheck={false}
          className="input"
          onFocus={startEditing}
          onBlur={saveEdit}
          value={draft}
          onInput={(e) => {
            setDraft((e.target as HTMLTextAreaElement).value);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              saveEdit();
              props.ctx.editItemByIndex(props.index - 1);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              saveEdit();
              props.ctx.editItemByIndex(props.index + 1);
            }
          }}
        />
        <div className="buttons">
          {!props.isEditing && (
            <div
              className="button delete"
              onClick={deleteItem}
            >
              <Trash strokeClass="stroke" fillClass="fill" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}