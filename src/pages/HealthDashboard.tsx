import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { 
  getBloodOxygenMetrics, 
  getBloodPressureMetrics,
  getBloodSugarMetrics,
  getHeartRateMetrics, 
  getStepsMetrics,
  getTemperatureMetrics,
  getDevices,
  getUsers,
  type BloodOxygenMetric,
  type BloodPressureMetric,
  type BloodSugarMetric,
  type HeartRateMetric,
  type StepsMetric,
  type TemperatureMetric,
  type Device
} from '@/lib/health-api'

// Sidebar компонент
function HealthSidebar({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  return (
    <aside className="w-64 shrink-0 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4">
        <div className="text-lg font-semibold">Мониторинг</div>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        <NavItem icon="📊" label="Обзор" active={active === 'overview'} onClick={() => setActive('overview')} />
        <NavItem icon="❤️" label="Пульс" active={active === 'heart'} onClick={() => setActive('heart')} />
        <NavItem icon="🫁" label="Кислород" active={active === 'oxygen'} onClick={() => setActive('oxygen')} />
        <NavItem icon="💉" label="Давление" active={active === 'pressure'} onClick={() => setActive('pressure')} />
        <NavItem icon="🍬" label="Сахар" active={active === 'sugar'} onClick={() => setActive('sugar')} />
        <NavItem icon="🌡️" label="Температура" active={active === 'temperature'} onClick={() => setActive('temperature')} />
        <NavItem icon="👟" label="Шаги" active={active === 'steps'} onClick={() => setActive('steps')} />
        <div className="border-t my-2" />
        <NavItem icon="📱" label="Устройства" active={active === 'devices'} onClick={() => setActive('devices')} />
        <NavItem icon="👥" label="Пользователи" active={active === 'users'} onClick={() => setActive('users')} />
      </nav>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
        ${active ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default function HealthDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [oxygenData, setOxygenData] = useState<BloodOxygenMetric[]>([])
  const [pressureData, setPressureData] = useState<BloodPressureMetric[]>([])
  const [sugarData, setSugarData] = useState<BloodSugarMetric[]>([])
  const [heartRateData, setHeartRateData] = useState<HeartRateMetric[]>([])
  const [stepsData, setStepsData] = useState<StepsMetric[]>([])
  const [temperatureData, setTemperatureData] = useState<TemperatureMetric[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Редирект если не авторизован
  if (authLoading) return <div className="p-6">Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [oxygen, pressure, sugar, heart, steps, temp, devicesData, usersData] = await Promise.all([
          getBloodOxygenMetrics(),
          getBloodPressureMetrics(),
          getBloodSugarMetrics(),
          getHeartRateMetrics(),
          getStepsMetrics(),
          getTemperatureMetrics(),
          getDevices(),
          getUsers()
        ])
        setOxygenData(oxygen)
        setPressureData(pressure)
        setSugarData(sugar)
        setHeartRateData(heart)
        setStepsData(steps)
        setTemperatureData(temp)
        setDevices(devicesData)
        setUsers(usersData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex">
      <HealthSidebar active={activeSection} setActive={setActiveSection} />
      <div className="flex-1 p-6">Загрузка данных из Supabase...</div>
    </div>
  )
  if (error) return (
    <div className="flex">
      <HealthSidebar active={activeSection} setActive={setActiveSection} />
      <div className="flex-1 p-6 text-red-500">Ошибка: {error}</div>
    </div>
  )

  return (
    <div className="flex">
      <HealthSidebar active={activeSection} setActive={setActiveSection} />
      <main className="flex-1 p-6 space-y-6 overflow-auto h-[calc(100vh-3.5rem)]">
      <h1 className="text-2xl font-bold">Мониторинг здоровья</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Устройства</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            {devices[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                {devices[0].name}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей O₂</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oxygenData.length}</div>
            {oxygenData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {oxygenData[0].oxygen_saturation}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей давления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pressureData.length}</div>
            {pressureData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {pressureData[0].systolic}/{pressureData[0].diastolic}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей сахара</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sugarData.length}</div>
            {sugarData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {sugarData[0].blood_sugar} мг/дл
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей пульса</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heartRateData.length}</div>
            {heartRateData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {heartRateData[0].heart_rate} уд/мин
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей шагов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stepsData.length}</div>
            {stepsData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {stepsData[0].steps} шагов
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Записей температуры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{temperatureData.length}</div>
            {temperatureData[0] && (
              <div className="text-xs text-muted-foreground mt-1">
                Последняя: {temperatureData[0].temperature.toFixed(1)}°C
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние записи кислорода в крови</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">O₂ %</th>
                  <th className="text-left p-2">Время</th>
                </tr>
              </thead>
              <tbody>
                {oxygenData.slice(0, 10).map(row => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{row.id.slice(0, 8)}...</td>
                    <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                    <td className="p-2">{row.oxygen_saturation}%</td>
                    <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  )
}
