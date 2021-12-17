import React from "react";

type SVGProps = { fillClass: string; strokeClass: string };

// https://transform.tools/css-to-js

export function Nothing() {
  return <svg viewBox="0 0 1 1" />;
}

export function Circle({ fillClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 640 640">
      <path
        d="M530 320C530 435.9 435.9 530 320 530C204.1 530 110 435.9 110 320C110 204.1 204.1 110 320 110C435.9 110 530 204.1 530 320Z"
        opacity="1"
        fillOpacity="1"
        className={fillClass}
      />
    </svg>
  );
}

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

export function ChevronRight({ strokeClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <polyline
        points="184 112 328 256 184 400"
        className={strokeClass}
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "36px",
        }}
      />
    </svg>
  );
}

export function ChevronDown({ strokeClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <polyline
        points="112 184 256 328 400 184"
        className={strokeClass}
        style={{
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "36px",
        }}
      />
    </svg>
  );
}

export function BlankFile({ strokeClass }: SVGProps) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M416,221.25V416a48,48,0,0,1-48,48H144a48,48,0,0,1-48-48V96a48,48,0,0,1,48-48h98.75a32,32,0,0,1,22.62,9.37L406.63,198.63A32,32,0,0,1,416,221.25Z"
        className={strokeClass}
        style={{ fill: "none", strokeLinejoin: "round", strokeWidth: "32px" }}
      />
      <path
        d="M256,56V176a32,32,0,0,0,32,32H408"
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
