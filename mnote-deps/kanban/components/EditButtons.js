import React from "react";

const EditButtons = ({ handleSave, saveLabel, handleDelete, handleCancel }) => (
  <div className="edit-buttons">
    <div
      tabIndex="0"
      className="edit-button"
      style={{ backgroundColor: "#5aac44" }}
      onClick={handleSave}
    >
      {saveLabel}
    </div>
    {handleDelete && (
      <div
        tabIndex="0"
        className="edit-button"
        style={{ backgroundColor: "#f66", marginLeft: 0 }}
        onClick={handleDelete}
      >
        Delete
      </div>
    )}
    <div tabIndex="0" className="edit-button-cancel" onClick={handleCancel}>
      <ion-icon name="close" />
    </div>
  </div>
);

export default EditButtons;
