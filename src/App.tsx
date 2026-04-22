import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { menuItems } from './menu-items/menu-items'
import Layout from './components/layout/Layout'

function App() {
  return (
    <BrowserRouter>
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
