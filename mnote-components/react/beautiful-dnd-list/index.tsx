// react-beautiful-dnd reorderable list
// adapted from https://codepen.io/annaazzam/pen/MWbwbGm

import React from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  DraggableStateSnapshot,
  DraggingStyle,
  Droppable,
  DroppableProvidedProps,
  DroppableStateSnapshot,
  NotDraggingStyle,
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

// https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/drop-animation.md#skipping-the-drop-animation
function getStyle(
  style: DraggingStyle | NotDraggingStyle,
  snapshot: DraggableStateSnapshot
) {
  if (!snapshot.isDropAnimating) return style;
  return {
    ...style,
    transitionDuration: `0.00001s`,
  };
}

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
  skipDropAnim?: boolean;
  children: (props: {
    item: T;
    ref: React.Ref<any>;
    index: number;
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
          {(provided, snapshot) => {
            const { draggableProps } = provided;
            if (props.skipDropAnim)
              draggableProps.style = getStyle(
                draggableProps.style || {},
                snapshot
              );

            return props.children({
              item,
              index,
              ref: provided.innerRef,
              dragHandleProps: provided.dragHandleProps,
              draggableProps,
              isDragging: snapshot.isDragging,
            });
          }}
        </Draggable>
      ))}
    </>
  );
}
