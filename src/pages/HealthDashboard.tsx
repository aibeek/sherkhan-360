import { useEffect, useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { useLanguage } from '@/context/LanguageProvider'
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
  const { t } = useLanguage()
  return (
    <aside className="w-64 shrink-0 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4">
        <div className="text-lg font-semibold">{t('monitoring')}</div>
      </div>
      <nav className="px-3 pb-4 space-y-1">
        <NavItem icon="📊" label={t('overview')} active={active === 'overview'} onClick={() => setActive('overview')} />
        <NavItem icon="📈" label={t('efficiency')} active={active === 'efficiency'} onClick={() => setActive('efficiency')} />
        <NavItem icon="❤️" label={t('heartRateNav')} active={active === 'heart'} onClick={() => setActive('heart')} />
        <NavItem icon="🫁" label={t('oxygenNav')} active={active === 'oxygen'} onClick={() => setActive('oxygen')} />
        <NavItem icon="💉" label={t('pressureNav')} active={active === 'pressure'} onClick={() => setActive('pressure')} />
        <NavItem icon="🍬" label={t('sugarNav')} active={active === 'sugar'} onClick={() => setActive('sugar')} />
        <NavItem icon="🌡️" label={t('temperatureNav')} active={active === 'temperature'} onClick={() => setActive('temperature')} />
        <NavItem icon="👟" label={t('stepsNav')} active={active === 'steps'} onClick={() => setActive('steps')} />
        <div className="border-t my-2" />
        <NavItem icon="📱" label={t('devices')} active={active === 'devices'} onClick={() => setActive('devices')} />
        <NavItem icon="👥" label={t('users')} active={active === 'users'} onClick={() => setActive('users')} />
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
  const { t } = useLanguage()
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

  // --- Mock monitoring data for efficiency (temporary / not real) ---
  const [rangeFrom, setRangeFrom] = useState<string>(() => new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10))
  const [rangeTo, setRangeTo] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const monitoringSpec = useMemo(() => ({
    specialties: [
      { name: 'Бетонщик', hr0: 135, stepsPerHour: 1100 },
      { name: 'Арматурщик', hr0: 130, stepsPerHour: 1000 },
      { name: 'Каменщик', hr0: 125, stepsPerHour: 850 },
      { name: 'Монтажник', hr0: 138, stepsPerHour: 1150 },
      { name: 'Дорожный рабочий', hr0: 143, stepsPerHour: 1250 },
      { name: 'Разнорабочий', hr0: 130, stepsPerHour: 1100 }
    ]
  }), [])

  // Fake workers list (ложные работники) — used for demo / temporary calculations
  const mockWorkers = useMemo(() => [
    { id: 'w1', name: 'Иванов И.', spec: 'Бетонщик', avgHr: 140, stepsPerHour: 1050 },
    { id: 'w2', name: 'Петров П.', spec: 'Арматурщик', avgHr: 128, stepsPerHour: 980 },
    { id: 'w3', name: 'Сидоров С.', spec: 'Каменщик', avgHr: 130, stepsPerHour: 870 },
    { id: 'w4', name: 'Кузнецов К.', spec: 'Монтажник', avgHr: 136, stepsPerHour: 1180 },
    { id: 'w5', name: 'Морозов М.', spec: 'Дорожный рабочий', avgHr: 145, stepsPerHour: 1200 },
    { id: 'w6', name: 'Новиков Н.', spec: 'Разнорабочий', avgHr: 129, stepsPerHour: 1120 }
  ], [])

  // Compute per-specialty aggregated metrics from mockWorkers
  const specMetrics = useMemo(() => {
    return monitoringSpec.specialties.map(s => {
      const workers = mockWorkers.filter(w => w.spec === s.name)
      const avgHr = workers.length ? Math.round(workers.reduce((acc, w) => acc + w.avgHr, 0) / workers.length) : 0
      const avgSteps = workers.length ? Math.round(workers.reduce((acc, w) => acc + w.stepsPerHour, 0) / workers.length) : 0
      const hrDiff = avgHr ? avgHr - s.hr0 : 0
      // Simple efficiency calculation: average of HR and steps attainment (clamped)
      const hrScore = s.hr0 ? Math.max(0, 100 - Math.abs(hrDiff) / s.hr0 * 100) : 0
      const stepsScore = s.stepsPerHour ? Math.min(100, Math.round((avgSteps / s.stepsPerHour) * 100)) : 0
      const efficiency = Math.round((hrScore * 0.5) + (stepsScore * 0.5))
      return {
        name: s.name,
        expectedHr: s.hr0,
        expectedSteps: s.stepsPerHour,
        avgHr,
        avgSteps,
        hrDiff,
        efficiency
      }
    })
  }, [monitoringSpec, mockWorkers])

  // Редирект если не авторизован
  if (authLoading) return <div className="p-6">{t('loading')}</div>
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
      <div className="flex-1 p-6">{t('loadingData')}</div>
    </div>
  )
  if (error) return (
    <div className="flex">
      <HealthSidebar active={activeSection} setActive={setActiveSection} />
      <div className="flex-1 p-6 text-red-500">{t('loginError')}: {error}</div>
    </div>
  )

  return (
    <div className="flex">
      <HealthSidebar active={activeSection} setActive={setActiveSection} />
      <main className="flex-1 p-6 space-y-6 overflow-auto h-[calc(100vh-3.5rem)]">
      <h1 className="text-2xl font-bold">{t('healthMonitoring')}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('users')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('devices')}</CardTitle>
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
                {t('lastRecord')}: {oxygenData[0].oxygen_saturation}%
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
                {t('lastRecord')}: {pressureData[0].systolic}/{pressureData[0].diastolic}
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
                {t('lastRecord')}: {sugarData[0].blood_sugar} {t('mgdl')}
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
                {t('lastRecord')}: {heartRateData[0].heart_rate} {t('bpm')}
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
                {t('lastRecord')}: {stepsData[0].steps} {t('stepsUnit')}
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
                {t('lastRecord')}: {temperatureData[0].temperature.toFixed(1)}{t('celsius')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('bloodOxygenRecords')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">User ID</th>
                  <th className="text-left p-2">O₂ %</th>
                  <th className="text-left p-2">{t('time')}</th>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('testEfficiency')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm">{t('periodFrom')}</label>
            <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} className="border rounded px-2 py-1" />
            <label className="text-sm">{t('periodTo')}</label>
            <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} className="border rounded px-2 py-1" />
            <div className="text-xs text-muted-foreground ml-4">{t('testDataNote')}</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('specialty')}</th>
                  <th className="text-left p-2">{t('expectedHr')}</th>
                  <th className="text-left p-2">{t('actualHr')}</th>
                  <th className="text-left p-2">{t('delta')}</th>
                  <th className="text-left p-2">{t('expectedStepsPerHour')}</th>
                  <th className="text-left p-2">{t('actualStepsPerHour')}</th>
                  <th className="text-left p-2">{t('efficiencyPercent')}</th>
                </tr>
              </thead>
              <tbody>
                {specMetrics.map(s => (
                  <tr key={s.name} className="border-b">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2 font-mono">{s.expectedHr}</td>
                    <td className="p-2 font-mono">{s.avgHr || '-'}</td>
                    <td className="p-2">{s.hrDiff >= 0 ? `+${s.hrDiff}` : s.hrDiff}</td>
                    <td className="p-2 font-mono">{s.expectedSteps}</td>
                    <td className="p-2 font-mono">{s.avgSteps || '-'}</td>
                    <td className="p-2 font-bold">{s.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('testWorkers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">{t('fullName')}</th>
                  <th className="text-left p-2">{t('specialty')}</th>
                  <th className="text-left p-2">{t('hrPerMin')}</th>
                  <th className="text-left p-2">{t('stepsPerHour')}</th>
                </tr>
              </thead>
              <tbody>
                {mockWorkers.map(w => (
                  <tr key={w.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{w.id}</td>
                    <td className="p-2">{w.name}</td>
                    <td className="p-2">{w.spec}</td>
                    <td className="p-2 font-mono">{w.avgHr}</td>
                    <td className="p-2 font-mono">{w.stepsPerHour}</td>
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
