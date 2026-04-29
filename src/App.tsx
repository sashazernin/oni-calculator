import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { menuItems } from './menu-items/menu-items'
import Layout from './components/layout/Layout'

function basenameFromVite(): string | undefined {
  const raw = import.meta.env.BASE_URL
  if (raw === '/') return undefined
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

function App() {
  return (
    <BrowserRouter basename={basenameFromVite()}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {menuItems.map((item => {
            return (
              <Route key={item.href} path={'/' + item.href} element={item.component} />
            )
          }))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
