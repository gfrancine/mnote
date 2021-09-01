import React from "react";

type SVGProps = { fillClass: string; strokeClass: string };

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

export function ChevronUp({ strokeClass }: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <polyline
        points="112 328 256 184 400 328"
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
