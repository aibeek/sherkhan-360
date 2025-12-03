import './App.css'
import Navbar from '@/components/layout/Navbar'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { ChartBarInteractive } from '@/components/charts/ChartBarInteractive'
import Admin from '@/pages/Admin'

function Home() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Главная</h1>
      <p className="text-muted-foreground mt-2">{user ? `Привет, ${user.name}` : 'Вы не авторизованы'}</p>
      <div className="mt-6">
        <ChartBarInteractive />
      </div>
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
      </Routes>
    </div>
  )
}

export default App
