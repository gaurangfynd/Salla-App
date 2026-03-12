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

const BACKEND_URL = "http://localhost:3032";

// introspect has no storeId yet (it IS the auth step that gives us the storeId)
async function introspectToken(token: string, appId: string | null) {
  const res = await fetchWithAuth(
    `${BACKEND_URL}/api/salla/introspect`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, appId }),
    },
    { token },
  );
  const data = await res.json();
  console.log("data from introspect api", data);
  return data;
}

async function fetchCanCreateAgent(merchantId: number, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/canCreateAgent?merchantId=${merchantId}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  const data = await res.json();
  console.log("canCreateAgent response", data);
  return data?.data?.canCreate === true;
}

async function fetchAppData(merchantId: number, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/getApp?merchantId=${merchantId}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  if (!res.ok) throw new Error(`getApp error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  console.log("appData response", data);
  return data?.data ?? null;
}

async function fetchUsageData(merchantId: number, ownerEmail: string, token: string) {
  const url = `${BACKEND_URL}/api/salla/getUsage?merchantId=${encodeURIComponent(merchantId)}&ownerEmail=${encodeURIComponent(ownerEmail)}`;
  const res = await fetchWithAuth(url, { method: "GET" }, { token, storeId: merchantId });
  if (!res.ok) throw new Error(`getUsage error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  console.log("usageData response", data);
  return data?.data ?? null;
}

async function fetchSallaStoreInfo(token: string) {
  const res = await fetchWithAuth(
    `${BACKEND_URL}/api/salla/userInfo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    },
    { token }, // storeId unknown at this point (this call gives us the storeId)
  );
  const data = await res.json();
  console.log("salla user info", data);
  return data?.success && data?.data ? data.data : null;
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

        // 2) Try to get the short-lived session token from Salla
        const tokenValue = embedded.auth.getToken() || token;
        console.log("tokenValue", tokenValue, typeof appId, appId);
        if (!tokenValue) {
          return;
        }

        // 3) Send token to backend for verification / session creation
        const introspectData = await introspectToken(tokenValue, appId);
        
        if (introspectData.success) {
          embedded.ready();
          setMerchantId(introspectData.data.data.merchant_id);

          // 4) Fetch and store Salla store/user info
          const storeInfo = await fetchSallaStoreInfo(tokenValue);
          if (storeInfo) {
            setSallaStoreInfo(storeInfo);
            console.log("salla store info set", storeInfo);

            const merchantId = introspectData.data.data.merchant_id;
            const ownerEmail = storeInfo.email;

            // 5) Check if merchant can create a new bot
            const canCreate = await fetchCanCreateAgent(merchantId, ownerEmail, tokenValue);
            setAbleToCreateBot(canCreate);
            console.log("ableToCreateBot", canCreate);

            // 6) Fetch app data (copilot token etc.)
            const app = await fetchAppData(merchantId, ownerEmail, tokenValue);
            if (app) setAppData(app);

            // 7) Fetch usage data
            const usage = await fetchUsageData(merchantId, ownerEmail, tokenValue);
            if (usage) setUsageData(usage);
          }
        } else {
          console.error("Failed to initialize embedded", introspectData.message);
        }
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
