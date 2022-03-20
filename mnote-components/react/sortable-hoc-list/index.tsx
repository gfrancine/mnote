import React from "react";
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortEndHandler,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

export function List<T>(props: {
  items: T[];
  getKey: (item: T) => React.Key;
  onSort: (items: T[]) => unknown;
  // SortableItem must be between an element
  renderContainer: (children: React.ReactElement[]) => React.ReactElement;
  children: (props: { item: T; index: number }) => React.ReactElement;
  sortableProps?: SortableContainerProps;
}) {
  const onSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    props.onSort(arrayMoveImmutable(props.items, oldIndex, newIndex));
  };

  const SortableItem = SortableElement((itemProps: { item: T; idx: number }) =>
    props.children({
      item: itemProps.item,
      index: itemProps.idx,
    })
  );

  const SortableList = SortableContainer((listProps: { items: T[] }) =>
    props.renderContainer(
      listProps.items.map((item, index) => (
        <SortableItem
          key={props.getKey(item)}
          index={index}
          idx={index}
          item={item}
        />
      ))
    )
  );

  return (
    <SortableList
      items={props.items}
      onSortEnd={onSortEnd}
      {...props.sortableProps}
    />
  );
}
