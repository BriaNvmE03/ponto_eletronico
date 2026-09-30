import { useState, useEffect } from "react";

export function useHoverCapable() {
  const [capable, setCapable] = useState(true);
  useEffect(() => {
    setCapable(window.matchMedia("(hover: hover)").matches);
  }, []);
  return capable;
}
