import React, { createContext, useContext, useState } from "react";

type SallaMerchant = {
  id: number;
  username: string;
  name: string;
  avatar: string;
  store_location: string | null;
  plan: string;
  status: string;
  type: string;
  domain: string;
  tax_number: string | null;
  commercial_number: string | null;
  from_competitor: boolean;
  currency: string;
  kyc_country: string;
  created_at: string;
  subscription: {
    status: string;
    end_date: string;
    is_launched: boolean;
    renew: boolean;
    days_left: number | null;
  };
  referral: {
    code: string;
    url: string;
  };
};

type ActiveAdminStoreUser = {
  id: number;
  name: string;
  mobile: string;
  mobile_code: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  enabled: number;
};

type SallaStoreInfo = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  language: string;
  password_reset_required: number;
  created_at: string;
  merchant: SallaMerchant;
  context: {
    app: number;
    scope: string;
    exp: number;
  };
  activeAdminStoreUser: ActiveAdminStoreUser;
};

type SallaAppData = {
  copilot?: {
    token?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type SallaUsageData = {
  [key: string]: any;
};

type SallaAgentData = {
  id: string;
  token: string;
  name: string;
  icon: string;
};

type SallaContextValue = {
  locale: string | null;
  token: string | null;
  appId: string | null;
  dark: boolean;
  merchantId: string | null;
  setMerchantId: (id: string) => void;
  accessToken: string;
  setAccessToken: (token: string) => void;
  sallaStoreInfo: SallaStoreInfo | null;
  setSallaStoreInfo: (info: SallaStoreInfo) => void;
  ableToCreateBot: boolean;
  setAbleToCreateBot: (value: boolean) => void;
  appData: SallaAppData | null;
  setAppData: (data: SallaAppData) => void;
  usageData: SallaUsageData | null;
  setUsageData: (data: SallaUsageData) => void;
  agentData: SallaAgentData | null;
  setAgentData: (data: SallaAgentData) => void;
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

type SallaParams = Omit<
  SallaContextValue,
  | "merchantId" | "setMerchantId"
  | "accessToken" | "setAccessToken"
  | "sallaStoreInfo" | "setSallaStoreInfo"
  | "ableToCreateBot" | "setAbleToCreateBot"
  | "appData" | "setAppData"
  | "usageData" | "setUsageData"
  | "agentData" | "setAgentData"
>;

const parseSallaParams = (): SallaParams => {
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
  const [params] = useState<SallaParams>(parseSallaParams);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [sallaStoreInfo, setSallaStoreInfo] = useState<SallaStoreInfo | null>(null);
  const [ableToCreateBot, setAbleToCreateBot] = useState<boolean>(false);
  const [appData, setAppData] = useState<SallaAppData | null>(null);
  const [usageData, setUsageData] = useState<SallaUsageData | null>(null);
  const [agentData, setAgentData] = useState<SallaAgentData | null>(null);

  return (
    <SallaContext.Provider
      value={{
        ...params,
        merchantId,
        setMerchantId,
        accessToken,
        setAccessToken,
        sallaStoreInfo,
        setSallaStoreInfo,
        ableToCreateBot,
        setAbleToCreateBot,
        appData,
        setAppData,
        usageData,
        setUsageData,
        agentData,
        setAgentData,
      }}
    >
      {children}
    </SallaContext.Provider>
  );
};

