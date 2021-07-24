import React, { useReducer, useState } from "react";
import Board from "./Board";
import { defaultValue } from "./util";

function combine(map) {
  return (state, action) => {
    const newState = {};
    for (const k in map) {
      newState[k] = map[k](state[k], action);
    }
    return newState;
  };
}

// g:
// the original board was bound to a global redux store,
// so I moved it to a wrapper component with useReducer

export default function StatefulBoard({
  initialState = defaultValue(),
  onChange,
}) {
  const boardReducer = (state = { lists: [] }, action) => {
    switch (action.type) {
      case "ADD_LIST": {
        const { listId } = action.payload;
        return { lists: [...state.lists, listId] };
      }
      case "MOVE_LIST": {
        const { oldListIndex, newListIndex } = action.payload;
        const newLists = Array.from(state.lists);
        const [removedList] = newLists.splice(oldListIndex, 1);
        newLists.splice(newListIndex, 0, removedList);
        return { lists: newLists };
      }
      case "DELETE_LIST": {
        const { listId } = action.payload;
        const filterDeleted = (tmpListId) => tmpListId !== listId;
        const newLists = state.lists.filter(filterDeleted);
        return { lists: newLists };
      }
      default:
        return state;
    }
  };

  const listsByIdReducer = (state = {}, action) => {
    switch (action.type) {
      case "ADD_LIST": {
        const { listId, listTitle } = action.payload;
        return {
          ...state,
          [listId]: { _id: listId, title: listTitle, cards: [] },
        };
      }
      case "CHANGE_LIST_TITLE": {
        const { listId, listTitle } = action.payload;
        return {
          ...state,
          [listId]: { ...state[listId], title: listTitle },
        };
      }
      case "DELETE_LIST": {
        const { listId } = action.payload;
        const { [listId]: deletedList, ...restOfLists } = state;
        return restOfLists;
      }
      case "ADD_CARD": {
        const { listId, cardId } = action.payload;
        return {
          ...state,
          [listId]: {
            ...state[listId],
            cards: [...state[listId].cards, cardId],
          },
        };
      }
      case "MOVE_CARD": {
        const {
          oldCardIndex,
          newCardIndex,
          sourceListId,
          destListId,
        } = action.payload;
        // Move within the same list
        if (sourceListId === destListId) {
          const newCards = Array.from(state[sourceListId].cards);
          const [removedCard] = newCards.splice(oldCardIndex, 1);
          newCards.splice(newCardIndex, 0, removedCard);
          return {
            ...state,
            [sourceListId]: { ...state[sourceListId], cards: newCards },
          };
        }
        // Move card from one list to another
        const sourceCards = Array.from(state[sourceListId].cards);
        const [removedCard] = sourceCards.splice(oldCardIndex, 1);
        const destinationCards = Array.from(state[destListId].cards);
        destinationCards.splice(newCardIndex, 0, removedCard);
        return {
          ...state,
          [sourceListId]: { ...state[sourceListId], cards: sourceCards },
          [destListId]: { ...state[destListId], cards: destinationCards },
        };
      }
      case "DELETE_CARD": {
        const { cardId: deletedCardId, listId } = action.payload;
        const filterDeleted = (cardId) => cardId !== deletedCardId;
        return {
          ...state,
          [listId]: {
            ...state[listId],
            cards: state[listId].cards.filter(filterDeleted),
          },
        };
      }
      default:
        return state;
    }
  };

  const cardsByIdReducer = (state = {}, action) => {
    switch (action.type) {
      case "ADD_CARD": {
        const { cardTitle = "", cardText = "", cardId } = action.payload;
        return {
          ...state,
          [cardId]: { title: cardTitle, text: cardText, _id: cardId },
        };
      }
      case "CHANGE_CARD_TEXT": {
        const { cardTitle, cardText, cardId } = action.payload;
        return {
          ...state,
          [cardId]: { ...state[cardId], title: cardTitle, text: cardText },
        };
      }
      case "DELETE_CARD": {
        const { cardId } = action.payload;
        const { [cardId]: deletedCard, ...restOfCards } = state;
        return restOfCards;
      }
      // Find every card from the deleted list and remove it
      case "DELETE_LIST": {
        const { cards: cardIds } = action.payload;
        return Object.keys(state)
          .filter((cardId) => !cardIds.includes(cardId))
          .reduce(
            (newState, cardId) => ({ ...newState, [cardId]: state[cardId] }),
            {},
          );
      }
      default:
        return state;
    }
  };

  const reducer = combine({
    board: boardReducer,
    listsById: listsByIdReducer,
    cardsById: cardsByIdReducer,
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  // do not fire onChange on the first mount
  const [hasMounted, setHasMounted] = useState(false);
  if (onChange && hasMounted) {
    onChange(state);
  }
  if (!hasMounted) {
    setHasMounted(true);
  }

  return <Board appState={state} dispatch={dispatch} />;
}
