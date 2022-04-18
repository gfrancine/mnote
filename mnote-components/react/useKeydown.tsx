import { useEffect, useState } from "react";

export function useKeydown(key: string) {
  const [isKeyDown, setIsKeyDown] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isKeyDown) return;
      if (e.key === key) setIsKeyDown(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === key) setIsKeyDown(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  return isKeyDown;
}
