import React from "react";

export function TrashIcon(props) {
  return (
    <div className="icon-wrapper" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="s-ion-icon"
      >
        <path
          className={props.iconClass}
          d={`M128 405.429C128 428.846 147.198 448 170.667 448h170.667C364.802 448 
          384 428.846 384 405.429V160H128v245.429zM416 96h-80l-26.785-32H202.786L176 
          96H96v32h320V96z`}
        ></path>
      </svg>
    </div>
  );
}

export function CloseIcon(props) {
  return (
    <div className="icon-wrapper" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="s-ion-icon"
      >
        <path
          className={props.iconClass}
          d={`M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256
          107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z`}
        ></path>
      </svg>
    </div>
  );
}
