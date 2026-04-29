import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages (project site): задайте VITE_BASE_URL=/имя-репозитория/ при сборке (см. .github/workflows/deploy-pages.yml)
function pagesBase(): string {
  const raw = process.env.VITE_BASE_URL
  if (raw == null || raw === '') return '/'
  return raw.endsWith('/') ? raw : `${raw}/`
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: pagesBase(),
})
