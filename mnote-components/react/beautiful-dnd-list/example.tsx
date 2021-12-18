// adapted from https://codepen.io/annaazzam/pen/MWbwbGm

import { Items, List } from "./index";
import React, { useState } from "react";

const classNames = (...names: (string | false)[]) =>
  names.filter((value) => value !== false).join(" ");

const listItems = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

export function Example() {
  const [items, setItems] = useState(listItems);

  return (
    <List items={items} onReorder={setItems}>
      {(props) => (
        <div
          ref={props.ref}
          className={classNames("list", props.isDraggingOver && "draggingOver")}
          {...props.droppableProps}
        >
          <Items items={items}>
            {(props) => (
              <div
                className={classNames("item", props.isDragging && "dragging")}
                style={props.draggableProps.style}
                ref={props.ref}
                {...props.draggableProps}
                {...props.dragHandleProps}
              >
                List item {props.item.id}
              </div>
            )}
          </Items>
          {props.placeholder}
        </div>
      )}
    </List>
  );
}
