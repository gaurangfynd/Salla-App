import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";
import AiAgentDetails from "./components/aiAgent/details";
import { useRef, useEffect } from "react";
import { embedded } from "@salla.sa/embedded-sdk";

function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        await embedded.init({ debug: true });
        embedded.page.setTitle("Store Registration");
        embedded.ready();
        console.log("embedded initialized");
      } catch (err) {
        console.error(err);
      }
    }

    init();
  }, []);
  console.log("initialized details", initialized.current);
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AIAgent />} />
          <Route path="/setup" element={<AIAgentSetup />} />
          <Route path="/details" element={<AiAgentDetails />} />
          <Route path="*" element={<AIAgent />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
