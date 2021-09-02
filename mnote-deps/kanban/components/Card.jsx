import React, { Component } from "react";
import { Draggable } from "react-beautiful-dnd";

import CardEditor from "./CardEditor";
import { TrashIcon } from "./icons";

// takes dispatch and its card
export default class Card extends Component {
  state = {
    hover: false,
    editing: false,
  };

  startHover = () => this.setState({ hover: true });
  endHover = () => this.setState({ hover: false });

  startEditing = () =>
    this.setState({
      hover: false,
      editing: true,
    });

  endEditing = () => this.setState({ hover: false, editing: false });

  editCard = (title, text) => {
    const { card, dispatch } = this.props;

    this.endEditing();

    dispatch({
      type: "CHANGE_CARD_TEXT",
      payload: { cardId: card._id, cardTitle: title, cardText: text },
    });
  };

  deleteCard = () => {
    const { listId, card, dispatch } = this.props;

    dispatch({
      type: "DELETE_CARD",
      payload: { cardId: card._id, listId },
    });
  };

  render() {
    const { card, index } = this.props;
    const { hover, editing } = this.state;

    if (!editing) {
      return (
        <Draggable draggableId={card._id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="card"
              onMouseEnter={this.startHover}
              onMouseLeave={this.endHover}
              onClick={this.startEditing}
            >
              {hover && (
                <div className="card-icons">
                  <div className="card-icon" onClick={this.deleteCard}>
                    <TrashIcon iconClass="icon-class" />
                  </div>
                </div>
              )}
              {card.title.length > 0 &&
                <div className="card-title">{card.title}</div>}
              {card.text.length > 0 &&
                <div className="card-text">{card.text}</div>}
            </div>
          )}
        </Draggable>
      );
    } else {
      return <CardEditor hideEditButtons card={card} onSave={this.editCard} />;
    }
  }
}
