import React from "react";
import {
  useDrag as dndUseDrag,
  DragSourceHookSpec,
  ConnectDragSource,
  ConnectDragPreview,
  DragObjectFactory,
  DragSourceMonitor,
} from "react-dnd";

import context from "./context";
import itemContext from "./itemContext";
import Connectable from "./types/Connectable";
import ID from "./types/ID";
import ObjectLiteral from "./types/ObjectLiteral";

export default function useDrag<
  DragObject extends ObjectLiteral,
  DropResult,
  CollectedProps
>(
  // @ts-ignore
  spec?: Partial<
    DragSourceHookSpec<
      DragObject & { type?: string | symbol },
      DropResult,
      CollectedProps
    >
  >
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  const connectedDragRef = React.useRef<Connectable>();
  const { setDragMonitor, setConnectedDragSource, setInitialDepth } =
    React.useContext(context);
  const fromItemCtx = React.useContext(itemContext);
  const { id, type, depth } = fromItemCtx;
  const [collectedProps, originalDonnectDragSource, connectDragPreview] =
    dndUseDrag<
      DragObject & { type: string | symbol; id: ID },
      DropResult,
      CollectedProps & { $isDragging: boolean }
    >({
      ...spec,
      collect: (monitor) => {
        const $isDragging = monitor.isDragging();
        return {
          ...((spec && spec.collect
            ? spec.collect(monitor)
            : undefined) as CollectedProps),
          $isDragging,
        };
      },
      isDragging: (monitor) => monitor.getItem().id === id,
      type,
      item: (monitor: DragSourceMonitor<DragObject>) => {
        setInitialDepth(depth);
        setDragMonitor(monitor);
        if (spec && spec.item) {
          const result = (spec.item as DragObjectFactory<DragObject>)(monitor);
          if (typeof result === "object") {
            return {
              type,
              ...result,
              id,
            } as DragObject & { type: string | symbol; id: ID };
          }
        }
        return {
          ...fromItemCtx,
          type,
          id,
        } as unknown as DragObject & { type: string | symbol; id: ID };
      },
      end(...args) {
        setInitialDepth(undefined);
        setDragMonitor(undefined);

        if (spec && spec.end) {
          spec.end(...args);
        }
      },
    });

  const connectDragSource = (
    ...args: Parameters<typeof originalDonnectDragSource>
  ) => {
    const result = originalDonnectDragSource(...args);
    // @ts-ignore
    connectedDragRef.current = result;
    return result;
  };

  const { $isDragging, ...rest } = collectedProps;

  React.useEffect(() => {
    if ($isDragging) {
      setConnectedDragSource(connectedDragRef);
    }
  }, [$isDragging, setConnectedDragSource]);

  return [
    // @ts-ignore
    rest,
    connectDragSource,
    connectDragPreview,
  ];
}
