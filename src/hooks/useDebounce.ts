import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(valor);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(valor);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [valor, delay]);

  return debounced;
}
