import React from "react";
import Connectable from "./types/Connectable";
import ID from "./types/ID";

type ItemContext = {
  index: number;
  id: ID;
  type: string | symbol;
  depth: number;
  data: any;
  onHoverEnd: (id: ID) => void;
  onHoverBegin: (
    id: ID,
    connectedDropTarget?:
      | React.MutableRefObject<Connectable | undefined>
      | undefined
  ) => void;
};

// @ts-ignore
const context = React.createContext<ItemContext>({});

export default context;
