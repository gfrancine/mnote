import React, { HTMLAttributes, useEffect } from "react";

// https://www.w3.org/TR/2019/NOTE-wai-aria-practices-1.1-20190814/examples/button/button.html
/** adds keyboard event listeners for button components */
export function useButton(
  ref: React.RefObject<HTMLElement>
): HTMLAttributes<HTMLElement> {
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (
        ref.current &&
        document.activeElement === ref.current &&
        (e.key === "Enter" || e.key === "Space")
      )
        ref.current.click();
    };

    const current = ref.current;
    current?.addEventListener("keydown", keydownListener);

    return () => current?.removeEventListener("keydown", keydownListener);
  });

  return {
    tabIndex: 0,
    role: "button",
  };
}
