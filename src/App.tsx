import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import AiAgentDetails from "./components/aiAgent/details";
import { useRef, useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { useSalla } from "./context/salla-context";
import { fetchWithAuth } from "./utils/fetchWithAuth";

const BACKEND_URL = "";

// introspect has no storeId yet (it IS the auth step that gives us the storeId)
async function introspectToken(token: string, appId: string | null) {
  console.log("in interospect")
  const res = await fetchWithAuth(
    `${BACKEND_URL}/api/salla/introspect`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, appId }),
    },
  );
  const data = await res.json();
  console.log("data from introspect api", data);
  return data;
}

async function fetchCanCreateAgent(merchantId: string, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/canCreateAgent?ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  const data = await res.json();
  console.log("canCreateAgent response", data);
  return data?.data?.canCreate === true;
}

async function fetchAppData(merchantId: string, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/getApp?sallaStoreId=${merchantId}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  if (!res.ok) throw new Error(`getApp error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  console.log("appData response", data);
  return data?.data ?? null;
}

async function fetchUsageData(merchantId: string, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/getUsage?sallaStoreId=${encodeURIComponent(merchantId)}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  if (!res.ok) throw new Error(`getUsage error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  console.log("usageData response", data);
  return data?.data ?? null;
}

async function fetchSallaStoreInfo(token: string, merchantId: string) {
  const res = await fetchWithAuth(
    `${BACKEND_URL}/api/salla/userInfo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    },
    { token, storeId: merchantId },
  );
  const data = await res.json();
  console.log("salla user info", data);
  if (!data?.success || !data?.data?.data) return null;
  return {
    ...data.data.data,
    activeAdminStoreUser: data.data.activeAdminStoreUser ?? null,
  };
}

function App() {
  const initialized = useRef(false);
  const {
    appId, token, locale, dark,
    setMerchantId,
    setSallaStoreInfo,
    setAbleToCreateBot,
    setAppData,
    setUsageData,
  } = useSalla();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        // 1) Establish connection with Salla Dashboard
        // await embedded.init({ debug: true });
        // embedded.ready();

        // 2) Try to get the short-lived session token from Salla
        // const tokenValue = embedded.auth.getToken() || token;
        const tokenValue = embedded.auth.getToken();  
        console.log("tokenValue", tokenValue, typeof appId, appId);
        if (!tokenValue) {
          return;
        }

        // 3) Send token to backend for verification / session creation
        // const introspectData = await introspectToken(tokenValue, appId);
        
        // if (introspectData.success) {
        //   embedded.ready();
        //   const merchantId = introspectData.data.data.merchant_id.toString();
        //   setMerchantId(merchantId);

        //   // 4) Fetch and store Salla store/user info
        //   const storeInfo = await fetchSallaStoreInfo(tokenValue, merchantId);
        //   if (storeInfo) {
        //     setSallaStoreInfo(storeInfo);
        //     console.log("salla store info set", storeInfo);

        //     const ownerEmail = storeInfo.email;

        //     // 5) Check if merchant can create a new bot
        //     const canCreate = await fetchCanCreateAgent(merchantId, ownerEmail, tokenValue);
        //     if(canCreate === true){
        //       setAbleToCreateBot(canCreate);
        //     }
        //     else{
        //     // check if AI bot has been created 
        //     }

        //     console.log("ableToCreateBot", canCreate);

        //     // 6) Fetch app data (copilot token etc.)
        //     const app = await fetchAppData(merchantId, ownerEmail, tokenValue);
        //     if (app) setAppData(app);

        //     // 7) Fetch usage data
        //     const usage = await fetchUsageData(merchantId, ownerEmail, tokenValue);
        //     if (usage) setUsageData(usage);
        //   }
        // } else {
        //   console.error("Failed to initialize embedded", introspectData.message);
        // }
      } catch (err) {
        console.error(err);
      }
    }

    init();
  }, [appId, token]);
  console.log("initialized details", initialized.current);
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AIAgent />} />
        <Route path="/setup" element={<AIAgentSetup />} />
        <Route path="/details" element={<AiAgentDetails />} />
        <Route path="*" element={<AIAgent />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
