export type TodoItemData = {
  id: string;
  done: boolean;
  text: string;
};

export type TodoOrderItem = {
  id: string;
  depth: number;
  collapsed: boolean;
};

export type TodoData = {
  title: string;
  items: Record<string, TodoItemData>;
  itemsOrder: TodoOrderItem[];
};

export type TodoItemContext = {
  setItemCompleted: (index: number, completed: boolean) => void;
  setItem: (id: string, value: TodoItemData) => void;
  deleteItem: (index: number) => void;
  setItemCollapsed: (index: number, collapsed: boolean) => void;
  appendNewItem: (newItem: Omit<TodoItemData, "id">) => void;
  setCurrentlyEditing: (id: string | null) => void;
  editItemByIndex: (index: number) => void;
};

export type TodoListFilterType = "all" | "active" | "completed";

export type TodoListFilterFactory = (
  items: Record<string, TodoItemData>,
  itemsOrder: TodoOrderItem[]
) => (index: number) => boolean;
