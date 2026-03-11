import React, { createContext, useContext, useEffect, useState } from "react";
import { embedded } from "@salla.sa/embedded-sdk";

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

  // 2) Listen to Salla embedded theme changes (if running inside Salla)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const anyEmbedded = embedded as any;
    const handler = (payload: any) => {
      const nextTheme: string | null =
        typeof payload === "string" ? payload : payload?.theme ?? null;

      if (isTheme(nextTheme)) {
        setTheme(nextTheme);
      }
    };

    if (typeof anyEmbedded?.onThemeChange === "function") {
      const unsubscribe = anyEmbedded.onThemeChange(handler);
      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    }
  }, []);

  // 3) Apply theme to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
