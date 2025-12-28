import './App.css'
import Navbar from '@/components/layout/Navbar'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { Route, Routes, Navigate } from 'react-router-dom'
import Admin from '@/pages/Admin'
import HealthDashboard from '@/pages/HealthDashboard'
import mainImage from '@/assets/main.jpeg'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useLanguage } from '@/context/LanguageProvider'

function Home() {
  const { t } = useLanguage()
  
  return (
    <div className="mx-auto max-w-4xl p-6">
      <p className="text-muted-foreground mt-2">{t('homeDescription')}</p>
      <img src={mainImage} alt={t('mainImage')} className="mt-6 w-full max-w-3xl rounded-lg border" />
    </div>
  )
}


function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/health" element={<HealthDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SpeedInsights />
    </div>
  )
}

export default App
