import { useState } from "preact/hooks";
import React from "react";
import { List } from "./index";

// https://github.com/clauderic/react-sortable-hoc

export function Example() {
  const [items, setItems] = useState([
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "Item 6",
  ]);
  return (
    <List
      items={items}
      onSort={setItems}
      getKey={(item) => item}
      renderContainer={(listChildren) => <ul>{listChildren} </ul>}
      sortableProps={{
        transitionDuration: 0,
      }}
    >
      {(itemProps) => <li>{itemProps.item}</li>}
    </List>
  );
}
