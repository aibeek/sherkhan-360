import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthProvider'
import { useLanguage } from '@/context/LanguageProvider'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  
  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      <div className="w-full px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-tight text-2xl md:text-3xl">
          <span className="uppercase">SHERHAN</span> <span className="text-brand">360</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex gap-1 border rounded-md p-1">
            <button
              onClick={() => setLanguage('ru')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                language === 'ru' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              EN
            </button>
          </div>
          
          {user ? (
            <>
              <Link to="/admin" className="text-sm underline-offset-4 hover:underline">{t('admin')}</Link>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" className="h-8" onClick={logout}>{t('logout')}</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm underline-offset-4 hover:underline">{t('login')}</Link>
              <Link to="/register" className="text-sm underline-offset-4 hover:underline">{t('register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

