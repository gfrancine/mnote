import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  TodoData,
  TodoItemContext,
  TodoItemData,
  TodoListFilterType,
} from "./types";
import TodoItem from "./TodoItem";
import NewTodo from "./NewTodo";
import { nanoid } from "nanoid";
import TextareaAutosize from "react-textarea-autosize";
import useWidth from "./useWidth";
import Menu from "mnote-components/react/dropdowns/Menu";
import Select from "mnote-components/react/dropdowns/Select";
import { useListener } from "mnote-util/useListener";

const NEW_ITEM_MOCK_ID = "_$*!(@)#%*!$@()#$NEWITEM";

export default function Todo(props: {
  initialState?: Partial<TodoData>;
  onChange?: (state: TodoData) => unknown;
}) {
  const [items, setItems] = useState<
    TodoData["items"]
  >(props.initialState?.items || {});

  const [itemsOrder, setItemsOrder] = useState<
    TodoData["itemsOrder"]
  >(props.initialState?.itemsOrder || []);

  const [title, setTitle] = useState<
    TodoData["title"]
  >(props.initialState?.title || "");

  const [currentlyEditing, setCurrentlyEditing] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<TodoListFilterType>("all");

  useListener(() => {
    props.onChange?.({
      title,
      items,
      itemsOrder,
    });
  }, [items, title, itemsOrder]);

  const filters: Record<TodoListFilterType, (item: TodoItemData) => boolean> = {
    all: () => true,
    active: (item) => !item.done,
    completed: (item) => item.done,
  };

  const ctx: TodoItemContext = {
    setItem: (id, value) =>
      setItems({
        ...items,
        [id]: value,
      }),
    deleteItem: (id, index) => {
      const newItems = { ...items };
      delete newItems[id];
      const newOrder = [...itemsOrder];
      newOrder.splice(index, 1);
      setItems(newItems);
      setItemsOrder(newOrder);
    },
    moveItemAtIndex: (oldIndex, newIndex) => {
      if (oldIndex === newIndex) return;
      const newOrder = [...itemsOrder];
      const id = newOrder[oldIndex];
      const insert = () => newOrder.splice(newIndex, 0, id);
      const remove = () => newOrder.splice(oldIndex, 1);

      if (newIndex > oldIndex) {
        insert();
        remove();
      } else {
        remove();
        insert();
      }

      setItemsOrder(newOrder);
    },
    createItem: (newItem) => {
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
        item.id,
      ]);
    },
    setCurrentlyEditing: (id: string | null) => {
      setCurrentlyEditing(id);
    },
    editItemByIndex: (index: number) => {
      const id = index === itemsOrder.length
        ? NEW_ITEM_MOCK_ID
        : itemsOrder[index];

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
    const newOrder = itemsOrder.filter((id) => {
      const removed = items[id].done;
      if (removed) removedIds.push(id);
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

  const amountCompleted: number = useMemo(
    () => {
      return Object.values(items).filter((item) => item.done).length;
    },
    [items],
  );

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
          className={"statsbar" +
            (isStatsbarSmall ? " small" : "")}
          ref={statsbarRef}
        >
          <div className="left">
            {amountCompleted} done, {itemsOrder.length - amountCompleted} active
          </div>
          <div className="right">
            <Select
              placeholder="Filter..."
              onChange={(value) => setFilterType(value)}
              options={[{
                text: "All",
                value: "all",
              }, {
                text: "Active",
                value: "active",
              }, {
                text: "Completed",
                value: "completed",
              }]}
            />
            <Menu
              text="More Actions"
              items={[{
                text: "Clear completed",
                onClick: () => clearCompleted(),
              }, {
                text: "Clear all",
                onClick: () => clearAll(),
              }]}
            />
          </div>
        </div>
      </div>
      <div className="todo-list">
        {itemsOrder.map((id, index) => {
          return filters[filterType || "all"](items[id])
            ? (
              <TodoItem
                index={index}
                key={id}
                item={items[id]}
                isEditing={id === currentlyEditing}
                ctx={ctx}
              />
            )
            : <Fragment key={id} />;
        })}
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
