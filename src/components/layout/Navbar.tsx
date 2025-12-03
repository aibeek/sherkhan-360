import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-tight text-2xl md:text-3xl">
          <span className="uppercase">SHERHAN</span> <span className="text-brand">360</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/admin" className="text-sm underline-offset-4 hover:underline">Demo</Link>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="outline" className="h-8" onClick={logout}>Выйти</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm underline-offset-4 hover:underline">Войти</Link>
              <Link to="/register" className="text-sm underline-offset-4 hover:underline">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

