// adapted from https://codepen.io/annaazzam/pen/MWbwbGm
// https://codesandbox.io/s/floral-water-s23xy

import { Items, List } from "./index";
import React, { useState } from "react";

const listItems = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

export function Example() {
  const [items, setItems] = useState(listItems);

  return (
    <List items={items} onReorder={setItems}>
      {(props) => (
        <div ref={props.ref} {...props.droppableProps}>
          <Items items={items}>
            {(props) => (
              <div
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
