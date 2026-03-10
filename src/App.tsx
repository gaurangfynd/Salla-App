import { useState } from "react";

import AIAgent from "./components/aiAgent";
import AIAgentSetup from "./components/aiAgent/setup";
import "./common/styles/main.less";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/theme-context";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AIAgent />} />
          <Route path="/setup" element={<AIAgentSetup />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
