import React, { Component } from "react";
import ListEditor from "./ListEditor";
import shortid from "shortid";
import EditButtons from "./EditButtons";

// takes dispatch
export default class AddList extends Component {
  state = {
    title: "",
  };

  handleChangeTitle = (e) => this.setState({ title: e.target.value });

  createList = () => {
    const { title } = this.state;
    const { dispatch } = this.props;

    this.props.setAddingList(false);

    dispatch({
      type: "ADD_LIST",
      payload: { listId: shortid.generate(), listTitle: title },
    });
  };

  render() {
    const { setAddingList } = this.props;
    const { title } = this.state;

    return (
      <div className="add-list-editor">
        <ListEditor
          title={title}
          handleChangeTitle={this.handleChangeTitle}
          onClickOutside={() => {
            setAddingList(false);
          }}
          saveList={this.createList}
        />

        <EditButtons
          handleSave={this.createList}
          saveLabel={"Add list"}
          handleCancel={() => {
            setAddingList(false);
          }}
        />
      </div>
    );
  }
}
