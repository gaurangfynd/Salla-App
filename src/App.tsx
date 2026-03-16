import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import AiAgentDetails from "./components/aiAgent/details";
import { useRef, useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { useSalla } from "./context/salla-context";
import {
  introspectToken,
  fetchCanCreateAgent,
  fetchAppData,
  fetchUsageData,
  fetchSallaStoreInfo,
} from "./utils/sallaApi";

function App() {
  const initialized = useRef(false);
  const {
    appId, token, locale, dark,
    setMerchantId,
    setAccessToken,
    setSallaStoreInfo,
    setAbleToCreateBot,
    setAppData,
    setUsageData,
    ableToCreateBot,
  } = useSalla();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        // 1) Establish connection with Salla Dashboard
        await embedded.init({ debug: true });
        // embedded.ready();

        // 2) Try to get the short-lived session token from Salla
        //  let tokenValue = embedded.auth.getToken() || token;
        let tokenValue = embedded.auth.getToken();
        console.log("tokenValue", tokenValue, typeof appId, appId);
        if (!tokenValue) {
          return;
        }

        // 3) Send token to backend for verification / session creation
        const introspectData = await introspectToken(tokenValue, appId);

        if (introspectData.success) {
          embedded.ready();
          console.log("introspectData", introspectData);
          const merchantId = introspectData?.data?.data?.merchant_id?.toString();
          console.log("merchantId", merchantId);
          setMerchantId(merchantId);
          console.log("introspectData.data.token_details.access_token", introspectData?.data?.token_details?.access_token);
          setAccessToken(introspectData?.data?.token_details?.access_token);
          tokenValue = introspectData?.data?.token_details?.access_token;
          console.log("tokenValue", tokenValue);

          // 4) Fetch and store Salla store/user info
          const storeInfo = await fetchSallaStoreInfo(tokenValue || "", merchantId);
          if (storeInfo) {
            setSallaStoreInfo(storeInfo);
            console.log("salla store info set", storeInfo);

            const ownerEmail = storeInfo.email;

            // 5) Check if merchant can create a new bot
            const canCreate = await fetchCanCreateAgent(merchantId, ownerEmail, tokenValue || "");
            if (canCreate === true) {
              setAbleToCreateBot(canCreate);
            }
            else {
              // check if AI bot has been created 
            }

            console.log("ableToCreateBot", canCreate);

            // 6) Fetch app data (copilot token etc.)
            const app = await fetchAppData(merchantId, ownerEmail, tokenValue || "");
            if (app) setAppData(app);

            // 7) Fetch usage data
            const usage = await fetchUsageData(merchantId, ownerEmail, tokenValue || "");
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
