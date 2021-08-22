import React from "react";

type SVGProps = { fillClass: string; strokeClass: string };

export function Close({ strokeClass }: SVGProps) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="368"
        y1="368"
        x2="144"
        y2="144"
        className={strokeClass}
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
      />
      <line
        x1="368"
        y1="144"
        x2="144"
        y2="368"
        className={strokeClass}
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
      />
    </svg>
  );
}

export function Add({ strokeClass }: SVGProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path d="M0 0L512 0L512 512L0 512L0 0Z" id="path_1" />
        <clipPath id="mask_1">
          <use xlinkHref="#path_1" />
        </clipPath>
      </defs>
      <g id="add-outline-svgrepo-com" transform="translate(16 16)">
        <path
          d="M0 0L512 0L512 512L0 512L0 0Z"
          id="Background"
          fill="none"
          fillRule="evenodd"
          stroke="none"
        />
        <g clipPath="url(#mask_1)">
          <path
            d="M1 0L1 288"
            transform="translate(255 112)"
            className={strokeClass}
            id="Line"
            fill="none"
            fillRule="evenodd"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M288 1L0 1"
            transform="translate(112 255)"
            className={strokeClass}
            id="Line"
            fill="none"
            fillRule="evenodd"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

export function Trash({ strokeClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path
        d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
      <line
        x1="80"
        y1="112"
        x2="432"
        y2="112"
        style={{
          strokeLinecap: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
      <path
        d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
      <line
        x1="256"
        y1="176"
        x2="256"
        y2="400"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
      <line
        x1="184"
        y1="176"
        x2="192"
        y2="400"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
      <line
        x1="328"
        y1="176"
        x2="320"
        y2="400"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
    </svg>
  );
}

export function Checkmark({ strokeClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <polyline
        points="416 128 192 384 96 288"
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "32px",
        }}
        className={strokeClass}
      />
    </svg>
  );
}
