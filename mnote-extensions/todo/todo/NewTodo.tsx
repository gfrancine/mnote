import React, { Fragment, useEffect, useRef, useState } from "react";
import { TodoItemContext } from "./types";
import TextareaAutosize from "react-textarea-autosize";
import { Add, Checkmark, Close } from "./icons";

export default function NewTodo(props: {
  isEditing: boolean;
  mockId: string;
  mockIndex: number;
  ctx: TodoItemContext;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (props.isEditing) {
      inputRef.current.focus();
    }
  });

  const startEditing = () => {
    props.ctx.setCurrentlyEditing(props.mockId);
  };

  const stopEditing = () => {
    props.ctx.setCurrentlyEditing(null);
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!props.isEditing) return;
    ref.current.focus();
  });

  return (
    <div className="todo-item">
      <div className="left-element add-icon">
        <Add strokeClass="stroke" fillClass="fill" />
      </div>
      <div className={"todo-text-input" + (props.isEditing ? " editing" : "")}>
        <TextareaAutosize
          ref={ref}
          placeholder={props.isEditing ? "What needs to be done?" : ""}
          spellCheck={false}
          className="input"
          onBlur={stopEditing}
          onFocus={startEditing}
          value={draft}
          onInput={(e) => {
            setDraft((e.target as HTMLTextAreaElement).value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setDraft("");
              props.ctx.createItem({
                text: draft,
                done: false,
              });
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              props.ctx.editItemByIndex(props.mockIndex - 1);
            }
          }}
        />
      </div>
    </div>
  );
}
