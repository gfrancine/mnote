import { RefObject, useEffect, useState } from "react";

export default function useWidth({
  ref,
  min = -Infinity,
  max = Infinity,
}: {
  ref: RefObject<HTMLElement>;
  min?: number;
  max?: number;
}) {
  const [size, setSize] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      // https://stackoverflow.com/a/58701523/16116382
      window.requestAnimationFrame(() => setSize(element.offsetWidth));
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    if (!hasInitialized) {
      updateSize();
      setHasInitialized(true);
    }

    return () => {
      observer.disconnect();
      const element = ref.current;
      if (!element) return;
      observer.unobserve(element);
    };
  });

  return size >= min && size <= max;
}
