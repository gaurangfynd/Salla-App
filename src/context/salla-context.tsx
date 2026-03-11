import React, { createContext, useContext, useState } from "react";

type SallaContextValue = {
  locale: string | null;
  token: string | null;
  appId: string | null;
  dark: boolean;
};

const SallaContext = createContext<SallaContextValue | undefined>(undefined);

export const useSalla = (): SallaContextValue => {
  const ctx = useContext(SallaContext);
  if (!ctx) {
    throw new Error("useSalla must be used within a SallaProvider");
  }
  return ctx;
};

type SallaProviderProps = {
  children: React.ReactNode;
};

const parseSallaParams = (): SallaContextValue => {
  if (typeof window === "undefined") {
    return { locale: null, token: null, appId: null, dark: false };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    locale: params.get("locale"),
    token: params.get("token"),
    appId: params.get("app_id"),
    dark: params.get("dark") === "true",
  };
};

export const SallaProvider: React.FC<SallaProviderProps> = ({ children }) => {
  // Lazy initializer: runs synchronously before first render, so all values
  // are available immediately when child components read the context.
  const [state] = useState<SallaContextValue>(parseSallaParams);

  return (
    <SallaContext.Provider value={state}>{children}</SallaContext.Provider>
  );
};

