import React, { useEffect } from "react";

export function useClickaway(
  ref: React.RefObject<HTMLElement>,
  onClick: () => unknown
) {
  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target &&
        !ref.current.contains(e.target as Element)
      ) {
        onClick();
      }
    };
    window.addEventListener("click", onClickAway);
    return () => window.removeEventListener("click", onClickAway);
  });
}
