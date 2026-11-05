import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { Automation } from './pages/Automation'
import { Customers } from './pages/Customers'
import { Docs } from './pages/Docs'
import { Infrastructure } from './pages/Infrastructure'
import { Migration } from './pages/Migration'
import { Overview } from './pages/Overview'
import { SOC } from './pages/SOC'
import { Security } from './pages/Security'

const BASE = '/Cloud_Bridge'

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path={`${BASE}/`} element={<Overview />} />
          <Route path={`${BASE}/infrastructure`} element={<Infrastructure />} />
          <Route path={`${BASE}/customers`} element={<Customers />} />
          <Route path={`${BASE}/migration`} element={<Migration />} />
          <Route path={`${BASE}/security`} element={<Security />} />
          <Route path={`${BASE}/soc`} element={<SOC />} />
          <Route path={`${BASE}/automation`} element={<Automation />} />
          <Route path={`${BASE}/docs`} element={<Docs />} />
          {/* Fallback */}
          <Route path="*" element={<Overview />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}
