import React, { Component } from "react";
import ListEditor from "./ListEditor";
import shortid from "shortid";
import EditButtons from "./EditButtons";

// takes dispatch
export default class AddList extends Component {
  state = {
    title: ""
  };

  handleChangeTitle = (e) => this.setState({ title: e.target.value });

  createList = async () => {
    const { title } = this.state;
    const { dispatch } = this.props;

    this.props.toggleAddingList();

    dispatch({
      type: "ADD_LIST",
      payload: { listId: shortid.generate(), listTitle: title }
    });
  };

  render() {
    const { toggleAddingList } = this.props;
    const { title } = this.state;

    return (
      <div className="add-list-editor">
        <ListEditor
          title={title}
          handleChangeTitle={this.handleChangeTitle}
          onClickOutside={toggleAddingList}
          saveList={this.createList}
        />

        <EditButtons
          handleSave={this.createList}
          saveLabel={"Add list"}
          handleCancel={toggleAddingList}
        />
      </div>
    );
  }
}
