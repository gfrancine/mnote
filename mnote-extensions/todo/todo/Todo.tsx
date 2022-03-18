import React, { Fragment, useMemo, useRef, useState } from "react";
import {
  TodoData,
  TodoItemContext,
  TodoItemData,
  TodoListFilterType,
  TodoListFilterFactory,
  TodoOrderItem,
} from "./types";
import { TodoItemSortlyRenderer } from "./TodoItem";
import NewTodo from "./NewTodo";
import { nanoid } from "nanoid";
import TextareaAutosize from "react-textarea-autosize";
import useWidth from "./useWidth";
import Menu from "mnote-components/react/dropdowns/Menu";
import Select from "mnote-components/react/dropdowns/Select";
import { useListener } from "mnote-util/useListener";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sortly, {
  ContextProvider,
  ItemRendererProps,
} from "mnote-deps/react-sortly/src";

const NEW_ITEM_MOCK_ID = "_$*!(@)#%*!$@()#$NEWITEM";

export default function Todo(props: {
  initialState?: Partial<TodoData>;
  onChange?: (state: TodoData) => unknown;
}) {
  const [items, setItems] = useState<TodoData["items"]>(
    props.initialState?.items || {}
  );

  const [itemsOrder, setItemsOrder] = useState<TodoData["itemsOrder"]>(
    props.initialState?.itemsOrder || []
  );

  const [title, setTitle] = useState<TodoData["title"]>(
    props.initialState?.title || ""
  );

  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);

  const getItemAncestors = (index: number) => {
    const ancestors: TodoOrderItem[] = [];
    const orderItem = itemsOrder[index];
    let currentDepth = orderItem.depth;
    for (let i = index; i > -1; i--) {
      const nextOrderItem = itemsOrder[i];
      if (nextOrderItem.depth < currentDepth) {
        ancestors.push(nextOrderItem);
        currentDepth = nextOrderItem.depth;
      }
      if (currentDepth === 0) break;
    }
    return ancestors;
  };

  const getItemDescendants = (index: number) => {
    const descendants: TodoOrderItem[] = [];
    const orderItem = itemsOrder[index];
    for (let i = index + 1; i < itemsOrder.length; i++) {
      const nextOrderItem = itemsOrder[i];
      if (nextOrderItem.depth <= orderItem.depth) break;
      descendants.push(nextOrderItem);
    }
    return descendants;
  };

  const [filterType, setFilterType] = useState<TodoListFilterType>("all");
  const makeCompletedFilterFactory = (
    predicate: (done: boolean) => boolean
  ) => {
    const filterFactory: TodoListFilterFactory = (items, itemsOrder) => {
      // show if item is active or has an active descendant
      const whitelistedAncestors = new Set<string>();

      for (let i = itemsOrder.length - 1; i > -1; i--) {
        const orderItem = itemsOrder[i];
        if (whitelistedAncestors.has(orderItem.id)) continue;
        if (predicate(items[orderItem.id].done))
          getItemAncestors(i).forEach(({ id }) => whitelistedAncestors.add(id));
      }

      return (index) => {
        const item = items[itemsOrder[index].id];
        return predicate(item.done) || whitelistedAncestors.has(item.id);
      };
    };
    return filterFactory;
  };

  const filters: Record<TodoListFilterType, TodoListFilterFactory> = {
    all: () => () => true,
    active: makeCompletedFilterFactory((done) => !done),
    completed: makeCompletedFilterFactory((done) => done),
  };

  const filter = useMemo(
    () => filters[filterType || "all"](items, itemsOrder),
    [items, itemsOrder, filterType]
  );

  useListener(() => {
    props.onChange?.({
      title,
      items,
      itemsOrder,
    });
  }, [items, title, itemsOrder]);

  const ctx: TodoItemContext = {
    setItemCompleted: (index, completed) => {
      let toComplete = [itemsOrder[index]];
      if (completed) toComplete = [...toComplete, ...getItemDescendants(index)];

      const completedItems: Record<string, TodoItemData> = {};
      toComplete.forEach(
        (orderItem) =>
          (completedItems[orderItem.id] = {
            ...items[orderItem.id],
            done: completed,
          })
      );

      setItems({
        ...items,
        ...completedItems,
      });
    },
    setItem: (id, value) =>
      setItems({
        ...items,
        [id]: value,
      }),
    deleteItem: (index) => {
      const newOrder = [...itemsOrder];
      const newItems = { ...items };
      const toDelete = [itemsOrder[index], ...getItemDescendants(index)];
      newOrder.splice(index, toDelete.length);
      toDelete.forEach(({ id }) => {
        delete newItems[id];
      });
      setItemsOrder(newOrder);
      setItems(newItems);
    },
    setItemCollapsed: (index, collapsed) => {
      const newOrder = [...itemsOrder];
      const newItemOrder = { ...newOrder[index], collapsed };
      newOrder[index] = newItemOrder;
      setItemsOrder(newOrder);
    },
    appendNewItem: (newItem) => {
      const item = {
        ...newItem,
        id: nanoid(),
      };
      setItems({
        ...items,
        [item.id]: item,
      });
      setItemsOrder([
        ...itemsOrder,
        {
          id: item.id,
          depth: 0,
          collapsed: false,
        },
      ]);
    },
    setCurrentlyEditing: (id: string | null) => {
      setCurrentlyEditing(id);
    },
    editItemByIndex: (index: number) => {
      const id =
        index === itemsOrder.length ? NEW_ITEM_MOCK_ID : itemsOrder[index].id;

      if (!id) return;
      setCurrentlyEditing(id);
    },
  };

  const statsbarRef = useRef<HTMLDivElement>(null);
  const isStatsbarSmall = useWidth({
    ref: statsbarRef,
    max: 560,
  });

  const clearCompleted = () => {
    const removedIds: string[] = [];
    const newOrder = itemsOrder.filter((orderItem) => {
      const removed = items[orderItem.id].done;
      if (removed) removedIds.push(orderItem.id);
      return !removed;
    });
    const newItems = { ...items };
    for (const id of removedIds) {
      delete newItems[id];
    }
    setItemsOrder(newOrder);
    setItems(newItems);
  };

  const clearAll = () => {
    setItems({});
    setItemsOrder([]);
  };

  const amountCompleted: number = useMemo(() => {
    return Object.values(items).filter((item) => item.done).length;
  }, [items]);

  return (
    <div className="todo">
      <div className="todo-header">
        <div className="title">
          <TextareaAutosize
            value={title}
            className="title-textarea"
            spellCheck={false}
            placeholder="Title..."
            onInput={(e) => {
              setTitle((e.target as HTMLTextAreaElement).value);
            }}
          />
        </div>
        <div
          className={"statsbar" + (isStatsbarSmall ? " small" : "")}
          ref={statsbarRef}
        >
          <div className="left">
            {amountCompleted} done, {itemsOrder.length - amountCompleted} active
          </div>
          <div className="right">
            <Select
              placeholder="Filter..."
              onChange={(value) => setFilterType(value)}
              options={[
                {
                  text: "All",
                  value: "all",
                },
                {
                  text: "Active",
                  value: "active",
                },
                {
                  text: "Completed",
                  value: "completed",
                },
              ]}
            />
            <Menu
              text="More Actions"
              items={[
                {
                  text: "Clear completed",
                  onClick: () => clearCompleted(),
                },
                {
                  text: "Clear all",
                  onClick: () => clearAll(),
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="todo-list">
        <DndProvider backend={HTML5Backend}>
          <ContextProvider>
            <Sortly items={itemsOrder} onChange={setItemsOrder}>
              {(() => {
                let lastCollapsedDepth: number | undefined;

                return (sortlyProps: ItemRendererProps<TodoOrderItem>) => {
                  if (
                    lastCollapsedDepth !== undefined &&
                    sortlyProps.data.depth > lastCollapsedDepth
                  ) {
                    return <Fragment key={sortlyProps.id} />;
                  } else {
                    lastCollapsedDepth = undefined;
                  }

                  if (sortlyProps.data.collapsed) {
                    lastCollapsedDepth = sortlyProps.data.depth;
                  }

                  const nextItemOrder = itemsOrder[sortlyProps.index + 1];
                  const hasChildren =
                    nextItemOrder &&
                    nextItemOrder.depth > sortlyProps.data.depth;

                  return filter(sortlyProps.index) ? (
                    <TodoItemSortlyRenderer
                      itemProps={{
                        index: sortlyProps.index,
                        item: items[sortlyProps.id],
                        isEditing: sortlyProps.id === currentlyEditing,
                        collapsed: sortlyProps.data.collapsed,
                        hasChildren,
                        ctx,
                      }}
                      sortlyProps={sortlyProps}
                      key={sortlyProps.id}
                    />
                  ) : (
                    <Fragment key={sortlyProps.id} />
                  );
                };
              })()}
            </Sortly>
          </ContextProvider>
        </DndProvider>
        <NewTodo
          ctx={ctx}
          mockId={NEW_ITEM_MOCK_ID}
          mockIndex={itemsOrder.length}
          isEditing={currentlyEditing === NEW_ITEM_MOCK_ID}
        />
      </div>
    </div>
  );
}
