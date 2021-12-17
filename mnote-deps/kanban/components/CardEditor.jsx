import React, { Component } from "react";
import TextareaAutosize from "react-textarea-autosize";
import EditButtons from "./EditButtons";

class CardEditor extends Component {
  state = {
    title: this.props.card?.title || "",
    text: this.props.card?.text || "",
  };

  elRef = React.createRef(null);

  handleChangeText = (event) => this.setState({ text: event.target.value });
  handleChangeTitle = (event) => this.setState({ title: event.target.value });

  onOutsideClick = (e) => {
    if (!this.elRef.current) return;
    const elements = document.elementsFromPoint(e.pageX, e.pageY);
    if (!elements.includes(this.elRef.current)) {
      this.props.onSave(this.state.title, this.state.text);
    }
  };

  componentDidMount() {
    document.addEventListener("click", this.onOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.onOutsideClick, false);
  }

  render() {
    const { text, title } = this.state;
    const { onSave, onCancel, onDelete, adding } = this.props;

    return (
      <div ref={this.elRef} className="edit-card">
        <div className="card">
          <TextareaAutosize
            autoFocus={title.length < 1}
            spellCheck={false}
            className="card-title edit-card-textarea"
            placeholder="Title"
            value={title}
            onChange={this.handleChangeTitle}
          />
          <TextareaAutosize
            autoFocus={title.length > 0}
            spellCheck={false}
            className="card-text edit-card-textarea"
            placeholder="Text"
            value={text}
            onChange={this.handleChangeText}
          />
        </div>

        {this.props.hideEditButtons ? (
          <></>
        ) : (
          <EditButtons
            handleSave={() => onSave(title, text)}
            saveLabel={adding ? "Add card" : "Save"}
            handleDelete={onDelete}
            handleCancel={onCancel}
          />
        )}
      </div>
    );
  }
}

export default CardEditor;
