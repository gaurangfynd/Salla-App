import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import AiAgentDetails from "./components/aiAgent/details";
import { useRef, useEffect, useContext } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { useSalla } from "./context/salla-context";


async function introspectToken(token: string, appId: string | null) {
  const res = await fetch("http://localhost:3032/api/salla/introspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, appId }),
  });
  const data = await res.json();
  console.log("data from introspect api", data);
  return data;
}

async function fetchSallaStoreInfo(token: string) {
  const res = await fetch("https://accounts.salla.sa/oauth2/user/info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log("salla user info", data);
  return data?.success && data?.data ? data.data : null;
}

function App() {
  const initialized = useRef(false);
  const { appId, token, locale, dark, setMerchantId, merchantId, setSallaStoreInfo } = useSalla();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        // 1) Establish connection with Salla Dashboard
        await embedded.init({ debug: true });

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
