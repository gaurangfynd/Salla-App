import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./index.css"
import { SallaProvider } from './context/salla-context.tsx'
import { ThemeProvider } from './context/theme-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SallaProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SallaProvider>
  </StrictMode>,
)
