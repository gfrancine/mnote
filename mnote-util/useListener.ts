import { useEffect, useState } from "react";

export function useListener(listener: () => void, depedencies?: unknown[]) {
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    listener();
  }, depedencies);
}
