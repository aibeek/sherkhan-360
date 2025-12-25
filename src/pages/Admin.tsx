import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/context/AuthProvider'
import {
  getBloodOxygenMetrics,
  getBloodPressureMetrics,
  getBloodSugarMetrics,
  getHeartRateMetrics,
  getStepsMetrics,
  getTemperatureMetrics,
  getDevices,
  type BloodOxygenMetric,
  type BloodPressureMetric,
  type BloodSugarMetric,
  type HeartRateMetric,
  type StepsMetric,
  type TemperatureMetric,
  type Device
} from '@/lib/health-api'

function Sidebar({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const [openHealth, setOpenHealth] = useState(true)
  return (
    <aside className="w-64 shrink-0 border-r bg-background">
      <div className="p-4 pt-2 border-b">
        <div className="text-lg font-semibold">Админ панель</div>
      </div>
      <nav className="px-3 py-4 space-y-2">
        <SectionHeader onClick={() => setOpenHealth(v => !v)} open={openHealth} title="Все данные" />
        {openHealth && (
          <div className="space-y-1">
            <NavItem icon={<WatchIcon />} label="Эффективность" active={active==='health-efficiency'} onClick={() => setActive('health-efficiency')} />
            <NavItem icon={<HeartIcon />} label="Здоровье" active={active==='health-all'} onClick={() => setActive('health-all')} />
          </div>
        )}
      </nav>
    </aside>
  )
}

function SectionHeader({ title, open, onClick }: { title: string; open: boolean; onClick: () => void }) {
  return (
    <button className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs text-muted-foreground bg-background hover:bg-muted" onClick={onClick}>
      <span>{title}</span>
      <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} />
    </button>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      data-active={active}
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm bg-background hover:bg-muted
                 data-[active=true]:bg-muted data-[active=true]:border data-[active=true]:border-brand data-[active=true]:font-semibold"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function IconBase(props: React.SVGProps<SVGSVGElement>) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} /> }
function WatchIcon() { return <IconBase className="h-4 w-4"><rect x="7" y="6" width="10" height="12" rx="2" /><rect x="9" y="8" width="6" height="8" rx="1" /></IconBase> }
function ChevronDownIcon({ className }: { className?: string }) { return <IconBase className={className}><polyline points="6 9 12 15 18 9" /></IconBase> }
function HeartIcon() { return <IconBase className="h-4 w-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></IconBase> }
function OxygenIcon() { return <IconBase className="h-4 w-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v6" /><path d="M8 12h8" /></IconBase> }
function PressureIcon() { return <IconBase className="h-4 w-4"><path d="M12 2v20" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="4" /></IconBase> }
function SugarIcon() { return <IconBase className="h-4 w-4"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12V6" /><path d="M12 12h6" /></IconBase> }
function TempIcon() { return <IconBase className="h-4 w-4"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></IconBase> }
function StepsIcon() { return <IconBase className="h-4 w-4"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20" /></IconBase> }

// Все данные здоровья на одной странице
function HealthAllView({ 
  heartData, oxygenData, pressureData, sugarData, tempData, stepsData, devices, loading, selectedDevice, setSelectedDevice
}: { 
  heartData: HeartRateMetric[]
  oxygenData: BloodOxygenMetric[]
  pressureData: BloodPressureMetric[]
  sugarData: BloodSugarMetric[]
  tempData: TemperatureMetric[]
  stepsData: StepsMetric[]
  devices: Device[]
  loading: boolean
  selectedDevice: string
  setSelectedDevice: (id: string) => void
}) {
  if (loading) return <div className="p-6">Загрузка данных...</div>

  // Фильтрация данных по выбранному устройству
  const filteredHeart = selectedDevice === 'all' ? heartData : heartData.filter(d => d.device_id === selectedDevice)
  const filteredOxygen = selectedDevice === 'all' ? oxygenData : oxygenData.filter(d => d.device_id === selectedDevice)
  const filteredPressure = selectedDevice === 'all' ? pressureData : pressureData.filter(d => d.device_id === selectedDevice)
  const filteredSugar = selectedDevice === 'all' ? sugarData : sugarData.filter(d => d.device_id === selectedDevice)
  const filteredTemp = selectedDevice === 'all' ? tempData : tempData.filter(d => d.device_id === selectedDevice)
  const filteredSteps = selectedDevice === 'all' ? stepsData : stepsData.filter(d => d.device_id === selectedDevice)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мониторинг здоровья</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Устройство:</label>
          <select 
            value={selectedDevice} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm min-w-[200px]"
          >
            <option value="all">Все устройства ({devices.length})</option>
            {devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.mac_address})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HeartIcon />
              <span className="text-2xl font-bold text-red-500">{filteredHeart.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей пульса</div>
            {filteredHeart[0] && <div className="text-sm mt-1">{filteredHeart[0].heart_rate} уд/мин</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <OxygenIcon />
              <span className="text-2xl font-bold text-blue-500">{filteredOxygen.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей O₂</div>
            {filteredOxygen[0] && <div className="text-sm mt-1">{filteredOxygen[0].oxygen_saturation}%</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PressureIcon />
              <span className="text-2xl font-bold text-purple-500">{filteredPressure.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей давления</div>
            {filteredPressure[0] && <div className="text-sm mt-1">{filteredPressure[0].systolic}/{filteredPressure[0].diastolic}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <SugarIcon />
              <span className="text-2xl font-bold text-pink-500">{filteredSugar.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей сахара</div>
            {filteredSugar[0] && <div className="text-sm mt-1">{filteredSugar[0].blood_sugar} мг/дл</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TempIcon />
              <span className="text-2xl font-bold text-orange-500">{filteredTemp.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей темп.</div>
            {filteredTemp[0] && <div className="text-sm mt-1">{filteredTemp[0].temperature.toFixed(1)}°C</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StepsIcon />
              <span className="text-2xl font-bold text-green-500">{filteredSteps.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей шагов</div>
            {filteredSteps[0] && <div className="text-sm mt-1">{filteredSteps[0].steps} шагов</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WatchIcon />
              <span className="text-2xl font-bold text-gray-500">{devices.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Устройств</div>
            {devices[0] && <div className="text-sm mt-1">{devices[0].is_connected ? 'Онлайн' : 'Офлайн'}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Таблицы в 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пульс */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><HeartIcon /> Пульс</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">Значение</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHeart.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.heart_rate} уд/мин</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Кислород */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><OxygenIcon /> Кислород в крови</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">O₂ %</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOxygen.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.oxygen_saturation}%</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Давление */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><PressureIcon /> Давление</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">Сист.</th>
                    <th className="text-left p-2">Диаст.</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPressure.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.systolic}</td>
                      <td className="p-2 font-semibold">{row.diastolic}</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Сахар */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><SugarIcon /> Сахар в крови</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">Уровень</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSugar.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.blood_sugar} мг/дл</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Температура */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><TempIcon /> Температура</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">Темп.</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemp.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.temperature.toFixed(1)}°C</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Шаги */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><StepsIcon /> Шаги</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">Шаги</th>
                    <th className="text-left p-2">Ккал</th>
                    <th className="text-left p-2">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{row.steps}</td>
                      <td className="p-2">{row.calories}</td>
                      <td className="p-2 text-xs">{new Date(row.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Устройства */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><WatchIcon /> Устройства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2">Название</th>
                  <th className="text-left p-2">MAC</th>
                  <th className="text-left p-2">Статус</th>
                  <th className="text-left p-2">Последняя синхр.</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(row => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-semibold">{row.name}</td>
                    <td className="p-2 font-mono text-xs">{row.mac_address}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${row.is_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {row.is_connected ? 'Подключено' : 'Отключено'}
                      </span>
                    </td>
                    <td className="p-2">{new Date(row.last_sync).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [active, setActive] = useState('health-all')
  const [selectedDevice, setSelectedDevice] = useState('all')
  
  // Health data states
  const [heartData, setHeartData] = useState<HeartRateMetric[]>([])
  const [oxygenData, setOxygenData] = useState<BloodOxygenMetric[]>([])
  const [pressureData, setPressureData] = useState<BloodPressureMetric[]>([])
  const [sugarData, setSugarData] = useState<BloodSugarMetric[]>([])
  const [tempData, setTempData] = useState<TemperatureMetric[]>([])
  const [stepsData, setStepsData] = useState<StepsMetric[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  // --- Mock monitoring efficiency data (temporary) ---
  const [rangeFrom, setRangeFrom] = useState<string>(() => new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0,10))
  const [rangeTo, setRangeTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [rangeFromTime, setRangeFromTime] = useState<string>(() => '00:00')
  const [rangeToTime, setRangeToTime] = useState<string>(() => '23:59')

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

  const mockObjects = useMemo(() => [
    { id: 'o1', name: 'Akbulak Riviera', city: 'Астана'},
    { id: 'o2', name: 'Europe City', city: 'Астана'},
    { id: 'o3', name: 'Ellington Hills', city: 'Астана' },
    { id: 'o4', name: 'The ONE', city: 'Астана'}
  ], []) as any[]

  const mockWorkers = useMemo(() => [
    // efficient on o1
    { id: 'w1', name: 'Иванов И.', spec: 'Бетонщик', avgHr: 140, stepsPerHour: 1050, objectId: 'o1' },
    // not efficient on o1 (low steps / elevated HR)
    { id: 'w2', name: 'Петров П.', spec: 'Арматурщик', avgHr: 150, stepsPerHour: 800, objectId: 'o1' },
    // efficient on o2
    { id: 'w3', name: 'Сидоров С.', spec: 'Каменщик', avgHr: 130, stepsPerHour: 870, objectId: 'o2' },
    // not efficient on o3 (lower steps)
    { id: 'w4', name: 'Кузнецов К.', spec: 'Монтажник', avgHr: 155, stepsPerHour: 900, objectId: 'o3' },
    // efficient on o2
    { id: 'w5', name: 'Морозов М.', spec: 'Дорожный рабочий', avgHr: 145, stepsPerHour: 1200, objectId: 'o2' },
    // not efficient on o4 (high HR, low steps)
    { id: 'w6', name: 'Новиков Н.', spec: 'Разнорабочий', avgHr: 160, stepsPerHour: 700, objectId: 'o4' }
  ], [])

  

  // Compute per-worker efficiency and status
  const workersWithStatus = useMemo(() => {
    return mockWorkers.map(w => {
      const spec = monitoringSpec.specialties.find(s => s.name === w.spec)
      if (!spec) return { ...w, efficiency: 0, isEfficient: false }
      const hrDiff = w.avgHr - spec.hr0
      const hrScore = spec.hr0 ? Math.max(0, 100 - Math.abs(hrDiff) / spec.hr0 * 100) : 0
      const stepsScore = spec.stepsPerHour ? Math.min(100, Math.round((w.stepsPerHour / spec.stepsPerHour) * 100)) : 0
      const efficiency = Math.round((hrScore * 0.5) + (stepsScore * 0.5))
      return { ...w, efficiency, isEfficient: efficiency >= 90 }
    })
  }, [mockWorkers, monitoringSpec])

  // Compute per-device stats from real metrics
  const computeDeviceStats = () => {
    const devs = selectedDevice === 'all' ? devices : devices.filter(d => d.id === selectedDevice)
    const rows = devs.map(d => {
      const heartFor = heartData.filter(h => h.device_id === d.id)
      const stepsFor = stepsData.filter(s => s.device_id === d.id)
      const avgHr = heartFor.length ? Math.round(heartFor.reduce((s, x) => s + x.heart_rate, 0) / heartFor.length) : 0
      const totalSteps = stepsFor.reduce((s, x) => s + x.steps, 0)
      // duration: use rangeFrom/rangeTo if available
      const start = new Date(`${rangeFrom}T00:00:00Z`).getTime()
      const end = new Date(`${rangeTo}T23:59:59Z`).getTime()
      const hours = Math.max(1, (end - start) / (1000 * 3600))
      const stepsPerHour = Math.round(totalSteps / hours)
      const spec = monitoringSpec.specialties[0] || { hr0: 135, stepsPerHour: 1000 }
      const hrDiff = avgHr - (spec.hr0 || 135)
      const hrScore = spec.hr0 ? Math.max(0, 100 - Math.abs(hrDiff) / spec.hr0 * 100) : 0
      const stepsScore = spec.stepsPerHour ? Math.min(100, Math.round((stepsPerHour / spec.stepsPerHour) * 100)) : 0
      const efficiency = Math.round((hrScore * 0.5) + (stepsScore * 0.5))
      return {
        id: d.id,
        name: d.name,
        avgHr: avgHr || null,
        stepsPerHour: stepsPerHour || null,
        efficiency,
        isEfficient: efficiency >= 90
      }
    })
    return rows
  }

  // (kept worker export removed — using device export for real metrics)

  const exportDevicesToCsv = (rows: any[]) => {
    const headers = ['Device ID','Name','Avg HR','Steps/hour','Status','Efficiency%']
    const lines = rows.map(r => {
      const cols = [r.id, r.name, r.avgHr ?? '-', r.stepsPerHour ?? '-', r.isEfficient ? 'Эффективный' : 'Неэффективный', r.efficiency ?? '-']
      return cols.map((v: any) => `"${String(v ?? '')}"`).join(';')
    })
    const csv = [headers.join(';'), ...lines].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const namePart = selectedDevice === 'all' ? 'all_devices' : selectedDevice
    a.href = url
    const fromPart = `${rangeFrom}_${rangeFromTime}`
    const toPart = `${rangeTo}_${rangeToTime}`
    a.download = `devices_${namePart}_${fromPart}_${toPart}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Загрузка данных при переключении раздела
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (active === 'health-all') {
          const deviceFilter = selectedDevice === 'all' ? undefined : selectedDevice
          const fromIso = rangeFrom ? `${rangeFrom}T00:00:00Z` : undefined
          const toIso = rangeTo ? `${rangeTo}T23:59:59Z` : undefined

          const [heart, oxygen, pressure, sugar, temp, steps, devs] = await Promise.all([
            getHeartRateMetrics(undefined, deviceFilter, fromIso, toIso),
            getBloodOxygenMetrics(undefined, deviceFilter, fromIso, toIso),
            getBloodPressureMetrics(undefined, deviceFilter, fromIso, toIso),
            getBloodSugarMetrics(undefined, deviceFilter, fromIso, toIso),
            getTemperatureMetrics(undefined, deviceFilter, fromIso, toIso),
            getStepsMetrics(undefined, deviceFilter, fromIso, toIso),
            getDevices()
          ])
          setHeartData(heart)
          setOxygenData(oxygen)
          setPressureData(pressure)
          setSugarData(sugar)
          setTempData(temp)
          setStepsData(steps)
          setDevices(devs)
        } else if (active === 'ww-watch') {
          setDevices(await getDevices())
        } else if (active === 'health-efficiency') {
          // Fetch devices and metric slices for efficiency monitoring
          const deviceFilter = selectedDevice === 'all' ? undefined : selectedDevice
          const fromIso = rangeFrom ? `${rangeFrom}T${(rangeFromTime || '00:00')}:00Z` : undefined
          const toIso = rangeTo ? `${rangeTo}T${(rangeToTime || '23:59')}:59Z` : undefined
          const [heart, steps, devs] = await Promise.all([
            getHeartRateMetrics(undefined, deviceFilter, fromIso, toIso),
            getStepsMetrics(undefined, deviceFilter, fromIso, toIso),
            getDevices()
          ])
          setHeartData(heart)
          setStepsData(steps)
          setDevices(devs)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (['health-all', 'ww-watch'].includes(active)) {
      loadData()
    }
  }, [active, selectedDevice, rangeFrom, rangeTo, rangeFromTime, rangeToTime])

  if (authLoading) return <div className="p-6">Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />

  function renderContent() {
    if (loading) return <div className="p-6">Загрузка данных...</div>
    
    switch (active) {
      case 'health-all':
        return <HealthAllView 
          heartData={heartData}
          oxygenData={oxygenData}
          pressureData={pressureData}
          sugarData={sugarData}
          tempData={tempData}
          stepsData={stepsData}
          devices={devices}
          loading={loading}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
        />
      case 'health-efficiency':
        return (
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">Мониторинг эффективности</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-3 bg-background/50 p-2 rounded-md border">
                    <span className="text-sm text-muted-foreground">Период</span>
                    <div className="flex items-center gap-2">
                      <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <input type="time" value={rangeFromTime} onChange={e => setRangeFromTime(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <span className="text-sm text-muted-foreground">—</span>
                      <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <input type="time" value={rangeToTime} onChange={e => setRangeToTime(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-background/50 p-2 rounded-md border">
                    <label className="text-sm text-muted-foreground">Браслет</label>
                    <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm min-w-[180px]">
                      <option value="all">Все браслеты</option>
                      {devices.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.mac_address})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const rows = computeDeviceStats()
                      exportDevicesToCsv(rows)
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm hover:bg-green-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M8 13v4" />
                      <path d="M12 13v4" />
                      <path d="M16 13v4" />
                    </svg>
                    Выгрузить
                  </button>
                </div>
              </div>

            {/* removed specMetrics card as requested */}

            <Card>
              <CardHeader>
                <CardTitle>Список браслетов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Название</th>
                        <th className="text-left p-2">—</th>
                        <th className="text-left p-2">Пульс</th>
                        <th className="text-left p-2">Шаг/ч</th>
                        
                        <th className="text-left p-2">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* If we have real metrics, compute per-device stats */}
                      {(() => {
                        const rows = computeDeviceStats()
                        return rows.map(r => (
                          <tr key={r.id} className="border-b">
                            <td className="p-2 font-mono text-xs">{r.id}</td>
                            <td className="p-2">{r.name}</td>
                            <td className="p-2">—</td>
                            <td className="p-2 font-mono">{r.avgHr || '-'}</td>
                            <td className="p-2 font-mono">{r.stepsPerHour || '-'}</td>
                            
                            <td className="p-2">
                              {r.isEfficient ? (
                                <span className="inline-block px-2 py-1 rounded text-sm bg-green-100 text-green-800 font-semibold">Эффективный</span>
                              ) : (
                                <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-red-800 font-semibold">Неэффективный</span>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">{r.efficiency}%</div>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Список тестовых работников</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">ФИО</th>
                        <th className="text-left p-2">Специальность</th>
                        <th className="text-left p-2">Пульс</th>
                        <th className="text-left p-2">Шаг/ч</th>
                        <th className="text-left p-2">Объект</th>
                        <th className="text-left p-2">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workersWithStatus.map(w => (
                        <tr key={w.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{w.id}</td>
                          <td className="p-2">{w.name}</td>
                          <td className="p-2">{w.spec}</td>
                          <td className="p-2 font-mono">{w.avgHr}</td>
                          <td className="p-2 font-mono">{w.stepsPerHour}</td>
                          <td className="p-2">{mockObjects.find(o => o.id === w.objectId)?.name || '-'}</td>
                          <td className="p-2">
                            {w.isEfficient ? (
                              <span className="inline-block px-2 py-1 rounded text-sm bg-green-100 text-green-800 font-semibold">Эффективный</span>
                            ) : (
                              <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-red-800 font-semibold">Неэффективный</span>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">{w.efficiency}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'ww-watch':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Часы WW</CardTitle>
              <CardDescription>Всего устройств: {devices.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Название</th>
                      <th className="text-left p-2">MAC</th>
                      <th className="text-left p-2">Статус</th>
                      <th className="text-left p-2">Последняя синхр.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(row => (
                      <tr key={row.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-semibold">{row.name}</td>
                        <td className="p-2 font-mono text-xs">{row.mac_address}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${row.is_connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {row.is_connected ? 'Подключено' : 'Отключено'}
                          </span>
                        </td>
                        <td className="p-2">{new Date(row.last_sync).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-background">
        <ScrollArea className="h-full">
          <Sidebar active={active} setActive={setActive} />
        </ScrollArea>
      </aside>
      <main className="ml-64 pt-2">
        <div className="p-6 max-w-7xl">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
