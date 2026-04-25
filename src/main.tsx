import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppThemeProvider } from './providers/app-theme-provider.tsx'
import DuplicantProvider from './providers/duplicant-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <DuplicantProvider>
        <App />
      </DuplicantProvider>
    </AppThemeProvider>
  </StrictMode>,
)
