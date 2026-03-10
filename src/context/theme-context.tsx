import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // 1) Read theme from query param once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qpTheme = params.get("theme"); // e.g. ?theme=dark

    if (isTheme(qpTheme)) {
      setTheme(qpTheme);
    }
  }, []);

  // 2) Apply theme to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
