import './App.css'
import Navbar from '@/components/layout/Navbar'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { Route, Routes, Navigate } from 'react-router-dom'
import Admin from '@/pages/Admin'
import mainImage from '@/assets/main.jpeg'

function Home() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Sherkhan 360</h1>
      <p className="text-muted-foreground mt-2">Умные устройства для повышения эффективности предприятия и безопасности сотрудников</p>
      <img src={mainImage} alt="Главное изображение" className="mt-6 w-full max-w-3xl rounded-lg border" />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
