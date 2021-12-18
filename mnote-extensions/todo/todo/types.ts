export type TodoItemData = {
  id: string;
  done: boolean;
  text: string;
};

export type TodoOrderItem = {
  id: string;
  depth: number;
};

export type TodoData = {
  title: string;
  items: Record<string, TodoItemData>;
  itemsOrder: TodoOrderItem[];
};

export type TodoItemContext = {
  setItem: (id: string, value: TodoItemData) => void;
  deleteItem: (id: string, index: number) => void;
  createItem: (newItem: Omit<TodoItemData, "id">) => void;
  setCurrentlyEditing: (id: string | null) => void;
  editItemByIndex: (index: number) => void;
};

export type TodoListFilterType = "all" | "active" | "completed";
