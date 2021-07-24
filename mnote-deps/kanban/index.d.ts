export interface Card {
  title: string;
  text: string;
}

export interface List {
  title: string;
  cards: string[];
}

export type KanbanState = {
  board: {
    lists: string[];
  };
  listsById: Record<string, List>;
  cardsById: Record<string, Card>;
};

declare function KanbanBoard(props: {
  initialState?: KanbanState;
  onChange?: (state: KanbanState) => void | Promise<void>;
});

export default KanbanBoard;
