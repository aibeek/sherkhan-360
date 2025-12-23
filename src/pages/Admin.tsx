import * as React from 'react'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PieActivity } from '@/components/charts/PieActivity'
import { RankingBar } from '@/components/charts/RankingBar'
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
      <div className="p-4">
        <div className="text-lg font-semibold">Админ панель</div>
      </div>
      <nav className="px-3 pb-4 space-y-2">
        <SectionHeader onClick={() => setOpenHealth(v => !v)} open={openHealth} title="Мониторинг здоровья" />
        {openHealth && (
          <div className="space-y-1">
            <NavItem icon={<HeartIcon />} label="Все данные" active={active==='health-all'} onClick={() => setActive('health-all')} />
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
function ClockIcon() { return <IconBase className="h-4 w-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></IconBase> }
function UsersIcon() { return <IconBase className="h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8a4 4 0 1 1-8 0" /></IconBase> }
function CalendarIcon() { return <IconBase className="h-4 w-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></IconBase> }
function PieChartIcon() { return <IconBase className="h-4 w-4"><path d="M12 12V3a9 9 0 1 1-9 9h9" /></IconBase> }
function FileTextIcon() { return <IconBase className="h-4 w-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></IconBase> }
function TableIcon() { return <IconBase className="h-4 w-4"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="9" y1="4" x2="9" y2="20" /><line x1="15" y1="4" x2="15" y2="20" /></IconBase> }
function SettingsIcon() { return <IconBase className="h-4 w-4"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></IconBase> }
function WatchIcon() { return <IconBase className="h-4 w-4"><rect x="7" y="6" width="10" height="12" rx="2" /><rect x="9" y="8" width="6" height="8" rx="1" /></IconBase> }
function ChevronDownIcon({ className }: { className?: string }) { return <IconBase className={className}><polyline points="6 9 12 15 18 9" /></IconBase> }
function HeartIcon() { return <IconBase className="h-4 w-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></IconBase> }
function OxygenIcon() { return <IconBase className="h-4 w-4"><circle cx="12" cy="12" r="10" /><path d="M12 6v6" /><path d="M8 12h8" /></IconBase> }
function PressureIcon() { return <IconBase className="h-4 w-4"><path d="M12 2v20" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="4" /></IconBase> }
function SugarIcon() { return <IconBase className="h-4 w-4"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12V6" /><path d="M12 12h6" /></IconBase> }
function TempIcon() { return <IconBase className="h-4 w-4"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></IconBase> }
function StepsIcon() { return <IconBase className="h-4 w-4"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20" /></IconBase> }

function Toolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="h-9 rounded-md border bg-background px-2 text-sm">
        <option>Бригада</option>
        <option>Бригада 1</option>
        <option>Бригада 2</option>
      </select>
      <input type="date" className="h-9 rounded-md border bg-background px-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-foreground" defaultChecked /> С учётом рабочего дня
      </label>
      <div className="ml-auto flex items-center gap-2">
        <Input placeholder="Быстрый поиск" className="w-64" />
        <Button className="h-9">Найти</Button>
      </div>
    </div>
  )
}

// Компоненты для отображения данных здоровья
function HeartRateView({ data }: { data: HeartRateMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>❤️ Пульс</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">Пульс</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.heart_rate} уд/мин</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function OxygenView({ data }: { data: BloodOxygenMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🫁 Кислород в крови</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">O₂ %</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.oxygen_saturation}%</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PressureView({ data }: { data: BloodPressureMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💉 Давление</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">Систолическое</th>
                <th className="text-left p-2">Диастолическое</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.systolic}</td>
                  <td className="p-2 font-semibold">{row.diastolic}</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function SugarView({ data }: { data: BloodSugarMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🍬 Сахар в крови</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">Уровень</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.blood_sugar} мг/дл</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function TemperatureView({ data }: { data: TemperatureMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🌡️ Температура</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">Температура</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.temperature.toFixed(1)}°C</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function StepsView({ data }: { data: StepsMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>👟 Шаги</CardTitle>
        <CardDescription>Всего записей: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left p-2">Шаги</th>
                <th className="text-left p-2">Калории</th>
                <th className="text-left p-2">Дистанция</th>
                <th className="text-left p-2">Время</th>
                <th className="text-left p-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.steps}</td>
                  <td className="p-2">{row.calories} ккал</td>
                  <td className="p-2">{row.distance} м</td>
                  <td className="p-2">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-xs">{row.user_id.slice(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DevicesView({ data }: { data: Device[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📱 Устройства</CardTitle>
        <CardDescription>Всего устройств: {data.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
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
              {data.map(row => (
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
  )
}

// Все данные здоровья на одной странице
function HealthAllView({ 
  heartData, oxygenData, pressureData, sugarData, tempData, stepsData, devices, loading 
}: { 
  heartData: HeartRateMetric[]
  oxygenData: BloodOxygenMetric[]
  pressureData: BloodPressureMetric[]
  sugarData: BloodSugarMetric[]
  tempData: TemperatureMetric[]
  stepsData: StepsMetric[]
  devices: Device[]
  loading: boolean
}) {
  if (loading) return <div className="p-6">Загрузка данных...</div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Мониторинг здоровья</h1>
      
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HeartIcon />
              <span className="text-2xl font-bold text-red-500">{heartData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей пульса</div>
            {heartData[0] && <div className="text-sm mt-1">{heartData[0].heart_rate} уд/мин</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <OxygenIcon />
              <span className="text-2xl font-bold text-blue-500">{oxygenData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей O₂</div>
            {oxygenData[0] && <div className="text-sm mt-1">{oxygenData[0].oxygen_saturation}%</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PressureIcon />
              <span className="text-2xl font-bold text-purple-500">{pressureData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей давления</div>
            {pressureData[0] && <div className="text-sm mt-1">{pressureData[0].systolic}/{pressureData[0].diastolic}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <SugarIcon />
              <span className="text-2xl font-bold text-pink-500">{sugarData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей сахара</div>
            {sugarData[0] && <div className="text-sm mt-1">{sugarData[0].blood_sugar} мг/дл</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TempIcon />
              <span className="text-2xl font-bold text-orange-500">{tempData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей темп.</div>
            {tempData[0] && <div className="text-sm mt-1">{tempData[0].temperature.toFixed(1)}°C</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StepsIcon />
              <span className="text-2xl font-bold text-green-500">{stepsData.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">Записей шагов</div>
            {stepsData[0] && <div className="text-sm mt-1">{stepsData[0].steps} шагов</div>}
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
                  {heartData.map(row => (
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
                  {oxygenData.map(row => (
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
                  {pressureData.map(row => (
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
                  {sugarData.map(row => (
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
                  {tempData.map(row => (
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
                  {stepsData.map(row => (
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

function AnalyticsView() {
  return (
    <>
      <Card>
        <CardContent className="p-4">
          <Toolbar />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieActivity />
        <RankingBar />
      </div>

      <Card className="mt-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Статистика эффективности</CardTitle>
          <CardDescription>Ключевые метрики</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <Metric title="Эффективная длительность смены" value="08 ч 44 мин" />
            <Metric title="Время неэффективности за смену" value="02 ч 12 мин" />
            <Metric title="Среднее время перемещения за смену" value="00 ч 38 мин" />
            <Metric title="Активная работа за смену" value="05 ч 54 мин" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [active, setActive] = useState('analytics')
  
  // Health data states
  const [heartData, setHeartData] = useState<HeartRateMetric[]>([])
  const [oxygenData, setOxygenData] = useState<BloodOxygenMetric[]>([])
  const [pressureData, setPressureData] = useState<BloodPressureMetric[]>([])
  const [sugarData, setSugarData] = useState<BloodSugarMetric[]>([])
  const [tempData, setTempData] = useState<TemperatureMetric[]>([])
  const [stepsData, setStepsData] = useState<StepsMetric[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)

  // Загрузка данных при переключении раздела
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (active === 'health-all') {
          const [heart, oxygen, pressure, sugar, temp, steps, devs] = await Promise.all([
            getHeartRateMetrics(),
            getBloodOxygenMetrics(),
            getBloodPressureMetrics(),
            getBloodSugarMetrics(),
            getTemperatureMetrics(),
            getStepsMetrics(),
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
  }, [active])

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
        />
      case 'ww-watch':
        return <DevicesView data={devices} />
      case 'analytics':
        return <AnalyticsView />
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Раздел в разработке</CardTitle>
              <CardDescription>Этот раздел скоро будет доступен</CardDescription>
            </CardHeader>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-14 bottom-0 w-64 border-r bg-background">
        <ScrollArea className="h-full">
          <Sidebar active={active} setActive={setActive} />
        </ScrollArea>
      </aside>
      <main className="pl-64">
        <div className="p-6 max-w-7xl">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
