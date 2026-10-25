import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppThemeProvider } from './providers/app-theme-provider.tsx'
import DuplicantProvider from './providers/duplicant-provider'
import LocalizationProvider from './providers/localization-provider.tsx'
import GoogleDriveProvider from './providers/google-drive-provider.tsx'
import AppSettingsProvider from './providers/app-settings-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleDriveProvider>
      <AppSettingsProvider>
        <AppThemeProvider>
          <LocalizationProvider>
            <DuplicantProvider>
              <App />
            </DuplicantProvider>
          </LocalizationProvider>
        </AppThemeProvider>
      </AppSettingsProvider>
    </GoogleDriveProvider>
  </StrictMode>,
)
