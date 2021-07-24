import React, { Component } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import List from "./List";
import AddList from "./AddList";

// takes an app state board and a dispatch
export default class Board extends Component {
  state = {
    addingList: false,
  };

  setAddingList = (boolean) => {
    console.log("set adding list", boolean);
    this.setState({ addingList: boolean });
  };

  handleDragEnd = ({ source, destination, type }) => {
    // dropped outside the allowed zones
    if (!destination) return;

    const { dispatch } = this.props;

    // Move list
    if (type === "COLUMN") {
      // Prevent update if nothing has changed
      if (source.index !== destination.index) {
        dispatch({
          type: "MOVE_LIST",
          payload: {
            oldListIndex: source.index,
            newListIndex: destination.index,
          },
        });
      }
      return;
    }

    // Move card
    if (
      source.index !== destination.index ||
      source.droppableId !== destination.droppableId
    ) {
      dispatch({
        type: "MOVE_CARD",
        payload: {
          sourceListId: source.droppableId,
          destListId: destination.droppableId,
          oldCardIndex: source.index,
          newCardIndex: destination.index,
        },
      });
    }
  };

  render() {
    const { appState, dispatch } = this.props;
    const { addingList } = this.state;

    return (
      <DragDropContext onDragEnd={this.handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided, _snapshot) => (
            <div className="board" ref={provided.innerRef}>
              {appState.board.lists.map((listId, index) => {
                return (
                  <List
                    list={appState.listsById[listId]}
                    listId={listId}
                    dispatch={dispatch}
                    key={listId}
                    appState={appState}
                    index={index}
                  />
                );
              })}

              {provided.placeholder}

              <div className="add-list">
                {addingList
                  ? (
                    <AddList
                      dispatch={dispatch}
                      setAddingList={this.setAddingList}
                    />
                  )
                  : (
                    <div
                      onClick={() => {
                        console.log("add list button");
                        this.setAddingList(true);
                      }}
                      className="add-list-button"
                    >
                      <ion-icon name="add" /> Add a list
                    </div>
                  )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
