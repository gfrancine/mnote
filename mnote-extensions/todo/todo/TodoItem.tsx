import React, { useEffect, useRef, useState } from "react";
import { TodoItemContext, TodoItemData, TodoOrderItem } from "./types";
import TextareaAutosize from "react-textarea-autosize";
import { Trash } from "./icons";
import {
  ItemRendererProps,
  useDrag,
  useDrop,
} from "mnote-deps/react-sortly/src";
import { ChevronRight, ChevronDown } from "mnote-components/react/icons-jsx";

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
          strokeWidth="4"
          className="outer"
        />
        {value && (
          <circle cx="50" cy="50" r="38" fill="black" className="inner" />
        )}
      </svg>
    </div>
  );
}

export type TodoItemProps = {
  index: number;
  item: TodoItemData;
  ctx: TodoItemContext;
  isEditing: boolean;
  collapsed: boolean;
  hasChildren: boolean;
};

export type TodoItemPropsWithDnd = TodoItemProps & {
  depth: number;
  dragRef: ReturnType<typeof useDrag>[1];
  dropRef: ReturnType<typeof useDrop>[1];
};

export function TodoItem(props: TodoItemPropsWithDnd) {
  const [draft, setDraft] = useState(props.item.text);

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
    props.ctx.deleteItem(props.index);
  };

  const toggleCollapsed = () => {
    props.ctx.setItemCollapsed(props.index, !props.collapsed);
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!props.isEditing) return;
    ref.current.focus();
  });

  return (
    <div
      ref={props.dropRef}
      style={{ paddingLeft: props.depth * 20 + "px" }}
      className={"todo-item" + (props.item.done ? " done" : "")}
    >
      <div ref={props.dragRef} className="inner">
        <CheckedBullet
          value={props.item.done}
          onClick={(completed) =>
            props.ctx.setItemCompleted(props.index, completed)
          }
        />
        <div
          className={"todo-text-input" + (props.isEditing ? " editing" : "")}
        >
          {props.hasChildren ? (
            <div className="collapse" onClick={toggleCollapsed}>
              {props.collapsed ? (
                <ChevronRight fillClass="fill" strokeClass="stroke" />
              ) : (
                <ChevronDown fillClass="fill" strokeClass="stroke" />
              )}
            </div>
          ) : (
            <></>
          )}
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
              <div className="button delete" onClick={deleteItem}>
                <Trash strokeClass="stroke" fillClass="fill" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TodoItemSortlyRenderer({
  itemProps,
  sortlyProps,
}: {
  itemProps: TodoItemProps;
  sortlyProps: ItemRendererProps<TodoOrderItem>;
}) {
  const { id, depth } = sortlyProps;
  const [, dragRef] = useDrag();
  const [, dropRef] = useDrop();

  return <TodoItem {...itemProps} {...{ id, depth, dragRef, dropRef }} />;
}
