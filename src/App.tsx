import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ServicesPage from './pages/ServicesPage'
import { registerDeviceToken } from './lib/registerDeviceToken'; 
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    registerDeviceToken();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<ServicesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App