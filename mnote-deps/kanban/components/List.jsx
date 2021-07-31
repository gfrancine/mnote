import React, { Component } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

import Card from "./Card";
import CardEditor from "./CardEditor";
import ListEditor from "./ListEditor";

import shortid from "shortid";

// takes appstate, its list, and dispatch
export default class List extends Component {
  state = {
    editingTitle: false,
    title: this.props.list.title,
    addingCard: false,
  };

  toggleAddingCard = () =>
    this.setState({ addingCard: !this.state.addingCard });

  addCard = (cardTitle, cardText) => {
    const { listId, dispatch } = this.props;

    this.toggleAddingCard();

    const cardId = shortid.generate();

    dispatch({
      type: "ADD_CARD",
      payload: { cardTitle, cardText, cardId, listId },
    });
  };

  toggleEditingTitle = () =>
    this.setState({ editingTitle: !this.state.editingTitle });

  handleChangeTitle = (e) => this.setState({ title: e.target.value });

  editListTitle = () => {
    const { listId, dispatch } = this.props;
    const { title } = this.state;

    this.toggleEditingTitle();

    dispatch({
      type: "CHANGE_LIST_TITLE",
      payload: { listId, listTitle: title },
    });
  };

  deleteList = () => {
    const { listId, list, dispatch } = this.props;
    dispatch({
      type: "DELETE_LIST",
      payload: { listId, cards: list.cards },
    });
  };

  render() {
    const { list, index } = this.props;
    const { editingTitle, addingCard, title } = this.state;

    return (
      <Draggable draggableId={list._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="list"
          >
            {editingTitle
              ? (
                <ListEditor
                  list={list}
                  title={title}
                  handleChangeTitle={this.handleChangeTitle}
                  saveList={this.editListTitle}
                  onClickOutside={this.editListTitle}
                  deleteList={this.deleteList}
                />
              )
              : (
                <div className="list-title" onClick={this.toggleEditingTitle}>
                  {list.title}
                </div>
              )}

            <Droppable droppableId={list._id}>
              {(provided, _snapshot) => (
                <div ref={provided.innerRef} className="lists-cards">
                  {list.cards &&
                    list.cards.map((cardId, index) => (
                      <Card
                        key={cardId}
                        cardId={cardId}
                        card={this.props.appState.cardsById[cardId]}
                        dispatch={this.props.dispatch}
                        index={index}
                        listId={list._id}
                      />
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {addingCard
              ? (
                <CardEditor
                  onSave={this.addCard}
                  onCancel={this.toggleAddingCard}
                  adding
                />
              )
              : (
                <div
                  className="toggle-add-card"
                  onClick={this.toggleAddingCard}
                >
                  <ion-icon name="add" /> Add a card
                </div>
              )}
          </div>
        )}
      </Draggable>
    );
  }
}
