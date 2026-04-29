import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppThemeProvider } from './providers/app-theme-provider.tsx'
import DuplicantProvider from './providers/duplicant-provider'
import LocalizationProvider from './providers/localization-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <LocalizationProvider>
        <DuplicantProvider>
          <App />
        </DuplicantProvider>
      </LocalizationProvider>
    </AppThemeProvider>
  </StrictMode>,
)
