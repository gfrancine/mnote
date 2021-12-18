// adapted from https://codepen.io/annaazzam/pen/MWbwbGm
// deno-lint-ignore-file no-explicit-any

import React from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  Droppable,
  DroppableProvidedProps,
} from "react-beautiful-dnd";

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export type BaseItem = { id: React.Key };

type DndPropChildrenReturnType = React.ReactElement<
  HTMLElement,
  string | React.JSXElementConstructor<any>
>;

export function List<T extends BaseItem>(props: {
  items: T[];
  onReorder: (items: T[]) => unknown;
  droppableId?: string;
  children: (props: {
    ref: React.Ref<any>;
    isDraggingOver: boolean;
    droppableProps: DroppableProvidedProps;
    placeholder: React.ReactNode;
  }) => DndPropChildrenReturnType;
}) {
  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination) return;
        props.onReorder(
          reorder(props.items, result.source.index, result.destination.index)
        );
      }}
    >
      <Droppable droppableId={props.droppableId || "droppable"}>
        {(provided, snapshot) =>
          props.children({
            ref: provided.innerRef,
            placeholder: provided.placeholder,
            droppableProps: provided.droppableProps,
            isDraggingOver: snapshot.isDraggingOver,
          })
        }
      </Droppable>
    </DragDropContext>
  );
}

export function Items<T extends BaseItem>(props: {
  items: T[];
  getDraggableId?: (item: T) => string;
  children: (props: {
    item: T;
    ref: React.Ref<any>;
    isDragging: boolean;
    dragHandleProps?: DraggableProvidedDragHandleProps;
    draggableProps: DraggableProvidedDraggableProps;
  }) => DndPropChildrenReturnType;
}) {
  return (
    <>
      {props.items.map((item, index) => (
        <Draggable
          key={item.id}
          draggableId={props.getDraggableId?.(item) || `${item.id}-id`}
          index={index}
        >
          {(provided, snapshot) =>
            props.children({
              item,
              ref: provided.innerRef,
              dragHandleProps: provided.dragHandleProps,
              draggableProps: provided.draggableProps,
              isDragging: snapshot.isDragging,
            })
          }
        </Draggable>
      ))}
    </>
  );
}
