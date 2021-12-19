// adapted from https://github.com/react-dnd/react-dnd/blob/v13.1.0/packages/examples-hooks/src/04-sortable/simple/Container.tsx/
// Copyright (c) 2015 Dan Abramov
// MIT License

import React from "react";
import { useRef } from "react";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { XYCoord } from "dnd-core";
import update from "immutability-helper";

type DragItem = {
  index: number;
  id: string;
  type: string;
};

type ChildrenFactory<T> = (props: {
  data: T;
  index: number;
  isDragging: boolean;
  innerRef: React.Ref<any>;
  innerProps: {
    "data-handler-id": symbol | string | null;
  };
}) => React.ReactElement;

function Item<T>(props: {
  itemType: string;
  data: T;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  getChild: ChildrenFactory<T>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: props.itemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = props.index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      props.moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: props.itemType,
    item: () => {
      return { index: props.index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return props.getChild({
    data: props.data,
    index: props.index,
    innerRef: ref,
    isDragging,
    innerProps: {
      "data-handler-id": handlerId,
    },
  });
}

export function List<T>(props: {
  items: T[];
  onReorder?: (items: T[]) => unknown;
  itemType: string;
  getKey: (item: T) => React.Key;
  children: ChildrenFactory<T>;
}) {
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = props.items[dragIndex];
    props.onReorder?.(
      update(props.items, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragItem],
        ],
      })
    );
  };

  return (
    <>
      {props.items.map((data, index) => (
        <Item
          key={props.getKey(data)}
          itemType={props.itemType}
          index={index}
          moveItem={moveItem}
          getChild={props.children}
          data={data}
        />
      ))}
    </>
  );
}
