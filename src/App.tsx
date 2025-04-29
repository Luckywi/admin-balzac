import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ServicesPage from './pages/ServicesPage'
import { registerPushNotifications } from './lib/pushNotifications';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    registerPushNotifications();
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