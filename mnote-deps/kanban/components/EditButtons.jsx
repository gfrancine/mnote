import React from "react";

const EditButtons = (
  { handleSave, saveLabel, handleCancel },
) => (
  <div className="edit-buttons">
    <div
      tabIndex="0"
      className="edit-button save"
      onClick={handleSave}
    >
      {saveLabel}
    </div>
    <div tabIndex="0" className="edit-button-cancel" onClick={handleCancel}>
      <ion-icon name="close" />
    </div>
  </div>
);

export default EditButtons;
