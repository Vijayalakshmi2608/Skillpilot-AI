import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light">("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme("light"),
    setTheme,
  };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
