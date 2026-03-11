import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import AiAgentDetails from "./components/aiAgent/details";
import { useRef, useEffect, useContext } from "react";
import { embedded } from "@salla.sa/embedded-sdk";
import { useSalla } from "./context/salla-context";


function App() {
  const initialized = useRef(false);
  const { appId, token, locale, dark } = useSalla();

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
          // Opened outside Salla: just mark the app as ready
          embedded.page.setTitle("Store Registration");
          return;
        }

        // 3) Send token to backend for verification / session creation
        const response = await fetch(
          "http://localhost:3032/api/salla/introspect",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: tokenValue, appId: appId }),
          }
        );
        const data = await response.json();
        console.log("data from introspect api", data);
        if (data.success) {
          embedded.ready();
          console.log("embedded initialized without Salla token");
        } else {
          console.error("Failed to initialize embedded", data.message);
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
