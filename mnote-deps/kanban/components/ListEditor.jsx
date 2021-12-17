import React, { Component } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { TrashIcon } from "./icons";

class ListEditor extends Component {
  ref = React.createRef();

  onEnter = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.props.saveList();
    }
  };

  handleClick = (e) => {
    if (!this.ref.current) return;
    const elements = document.elementsFromPoint(e.pageX, e.pageY);
    const addListContainer = this.ref.current.parentNode.parentNode;
    if (elements.includes(addListContainer)) return;
    this.props.onClickOutside();
  };

  componentDidMount() {
    document.addEventListener("click", this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick, false);
  }

  render() {
    const { title, handleChangeTitle, deleteList } = this.props;

    return (
      <div className="list-title-edit" ref={this.ref}>
        <TextareaAutosize
          autoFocus
          spellCheck={false}
          className="list-title-textarea"
          placeholder="Enter list title..."
          value={title}
          onChange={handleChangeTitle}
          onKeyDown={this.onEnter}
          style={{ width: deleteList ? 220 : 245 }}
        />
        {deleteList && (
          <TrashIcon iconClass="icon-class" onClick={deleteList} />
        )}
      </div>
    );
  }
}

export default ListEditor;
