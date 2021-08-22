import { RefObject, useEffect, useState } from "react";

export default function useWidth<T extends HTMLElement>(
  { ref, min = -Infinity, max = Infinity }: {
    ref: RefObject<T>;
    min?: number;
    max?: number;
  },
) {
  const [size, setSize] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => setSize(element.offsetWidth);
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    if (!hasInitialized) {
      updateSize();
      setHasInitialized(true);
    }

    return () => observer.disconnect();
  });

  return size >= min && size <= max;
}
