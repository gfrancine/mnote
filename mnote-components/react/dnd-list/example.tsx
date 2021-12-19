// adapted from https://github.com/react-dnd/react-dnd/blob/v13.1.0/packages/examples-hooks/src/04-sortable/simple/Container.tsx/
// Copyright (c) 2015 Dan Abramov
// MIT License

import React, { useState } from "react";
import { List } from "./index";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const todoCards = [
  {
    id: 1,
    text: "Write a cool JS library",
  },
  {
    id: 2,
    text: "Make it generic enough",
  },
  {
    id: 3,
    text: "Write README",
  },
];

export function Example() {
  const [cards, setCards] = useState(todoCards);

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <List
          items={cards}
          getKey={(item) => item.id}
          itemType="card"
          onReorder={setCards}
        >
          {(props) => (
            <div ref={props.innerRef} {...props.innerProps}>
              {props.data.text}
            </div>
          )}
        </List>
      </div>
    </DndProvider>
  );
}
