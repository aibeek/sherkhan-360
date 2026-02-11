import * as React from 'react'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/context/AuthProvider'
import { useLanguage } from '@/context/LanguageProvider'
import {
  getBloodOxygenMetrics,
  getBloodPressureMetrics,
  getBloodSugarMetrics,
  getHeartRateMetrics,
  getStepsMetrics,
  getUsers,
  type BloodOxygenMetric,
  type BloodPressureMetric,
  type BloodSugarMetric,
  type HeartRateMetric,
  type StepsMetric,
  type User
} from '@/lib/health-api'
import { calculateBraceletEfficiency, type BraceletRecord, type ShiftConfig, type BraceletEfficiency } from '@/core'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function formatTime24h(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  const seconds = String(d.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function getUserName(userId: string, users: User[]): string {
  const user = users.find(u => u.id === userId)
  return user?.full_name || 'Unknown'
}

function Sidebar({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  const [openHealth, setOpenHealth] = useState(true)
  const { t } = useLanguage()
  return (
    <aside className="w-64 shrink-0 border-r bg-background">
      <div className="p-4 pt-2 border-b">
        <div className="text-lg font-semibold">{t('adminPanel')}</div>
      </div>
      <nav className="px-3 py-4 space-y-2">
        <SectionHeader onClick={() => setOpenHealth(v => !v)} open={openHealth} title={t('allData')} />
        {openHealth && (
          <div className="space-y-1">
            <NavItem icon={<WatchIcon />} label={t('efficiency')} active={active==='health-efficiency'} onClick={() => setActive('health-efficiency')} />
            <NavItem icon={<HeartIcon />} label={t('health')} active={active==='health-all'} onClick={() => setActive('health-all')} />
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
function StepsIcon() { return <IconBase className="h-4 w-4"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20" /></IconBase> }

// Все данные здоровья на одной странице
function HealthAllView({ 
  heartData, oxygenData, pressureData, sugarData, stepsData, users, loading, selectedUser, setSelectedUser
}: { 
  heartData: HeartRateMetric[]
  oxygenData: BloodOxygenMetric[]
  pressureData: BloodPressureMetric[]
  sugarData: BloodSugarMetric[]
  stepsData: StepsMetric[]
  users: User[]
  loading: boolean
  selectedUser: string
  setSelectedUser: (id: string) => void
}) {
  const getUserNameById = (userId: string) => getUserName(userId, users)
  const { t } = useLanguage()
  if (loading) return <div className="p-6">{t('loadingData')}</div>

  // Фильтрация данных по выбранному пользователю
  const filteredHeart = selectedUser === 'all' ? heartData : heartData.filter(d => d.user_id === selectedUser)
  const filteredOxygen = selectedUser === 'all' ? oxygenData : oxygenData.filter(d => d.user_id === selectedUser)
  const filteredPressure = selectedUser === 'all' ? pressureData : pressureData.filter(d => d.user_id === selectedUser)
  const filteredSugar = selectedUser === 'all' ? sugarData : sugarData.filter(d => d.user_id === selectedUser)
  const filteredSteps = selectedUser === 'all' ? stepsData : stepsData.filter(d => d.user_id === selectedUser)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('healthMonitoring')}</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">{t('user')}:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm min-w-[200px]"
          >
            <option value="all">{t('allUsers')} ({users.length})</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HeartIcon />
              <span className="text-2xl font-bold text-red-500">{filteredHeart.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('heartRateRecords')}</div>
            {filteredHeart[0] && <div className="text-sm mt-1">{filteredHeart[0].heart_rate} {t('bpm')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <OxygenIcon />
              <span className="text-2xl font-bold text-blue-500">{filteredOxygen.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('oxygenRecords')}</div>
            {filteredOxygen[0] && <div className="text-sm mt-1">{filteredOxygen[0].oxygen_saturation}%</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PressureIcon />
              <span className="text-2xl font-bold text-purple-500">{filteredPressure.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('pressureRecords')}</div>
            {filteredPressure[0] && <div className="text-sm mt-1">{filteredPressure[0].systolic}/{filteredPressure[0].diastolic}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <SugarIcon />
              <span className="text-2xl font-bold text-pink-500">{filteredSugar.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('sugarRecords')}</div>
            {filteredSugar[0] && <div className="text-sm mt-1">{filteredSugar[0].blood_sugar} {t('mgdl')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StepsIcon />
              <span className="text-2xl font-bold text-green-500">{filteredSteps.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('stepsRecords')}</div>
            {filteredSteps[0] && <div className="text-sm mt-1">{filteredSteps[0].steps} {t('stepsUnit')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WatchIcon />
              <span className="text-2xl font-bold text-gray-500">{users.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('usersCount')}</div>
            {users[0] && <div className="text-sm mt-1">{users[0].full_name}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Таблицы в 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пульс */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><HeartIcon /> {t('heartRate')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">{t('fullName')}</th>
                    <th className="text-left p-2">{t('value')}</th>
                    <th className="text-left p-2">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHeart.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{getUserNameById(row.user_id)}</td>
                      <td className="p-2 font-bold">{row.heart_rate} {t('bpm')}</td>
                      <td className="p-2 text-xs">{formatTime24h(row.timestamp)}</td>
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
            <CardTitle className="text-lg flex items-center gap-2"><OxygenIcon /> {t('oxygen')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">{t('fullName')}</th>
                    <th className="text-left p-2">O₂ %</th>
                    <th className="text-left p-2">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOxygen.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{getUserNameById(row.user_id)}</td>
                      <td className="p-2 font-bold">{row.oxygen_saturation}%</td>
                      <td className="p-2 text-xs">{formatTime24h(row.timestamp)}</td>
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
            <CardTitle className="text-lg flex items-center gap-2"><PressureIcon /> {t('pressure')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">{t('fullName')}</th>
                    <th className="text-left p-2">{t('systolic')}</th>
                    <th className="text-left p-2">{t('diastolic')}</th>
                    <th className="text-left p-2">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPressure.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{getUserNameById(row.user_id)}</td>
                      <td className="p-2 font-semibold">{row.systolic}</td>
                      <td className="p-2 font-semibold">{row.diastolic}</td>
                      <td className="p-2 text-xs">{formatTime24h(row.timestamp)}</td>
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
            <CardTitle className="text-lg flex items-center gap-2"><SugarIcon /> {t('sugar')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">{t('fullName')}</th>
                    <th className="text-left p-2">{t('level')}</th>
                    <th className="text-left p-2">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSugar.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{getUserNameById(row.user_id)}</td>
                      <td className="p-2 font-bold">{row.blood_sugar} {t('mgdl')}</td>
                      <td className="p-2 text-xs">{formatTime24h(row.timestamp)}</td>
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
            <CardTitle className="text-lg flex items-center gap-2"><StepsIcon /> {t('steps')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs">
                    <th className="text-left p-2">{t('fullName')}</th>
                    <th className="text-left p-2">{t('steps')}</th>
                    <th className="text-left p-2">{t('calories')}</th>
                    <th className="text-left p-2">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSteps.map(row => (
                    <tr key={row.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-semibold">{getUserNameById(row.user_id)}</td>
                      <td className="p-2 font-semibold">{row.steps}</td>
                      <td className="p-2">{row.calories}</td>
                      <td className="p-2 text-xs">{formatTime24h(row.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Пользователи */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><WatchIcon /> {t('users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2">{t('fullName')}</th>
                  <th className="text-left p-2">{t('email')}</th>
                  <th className="text-left p-2">{t('lastLogin')}</th>
                  <th className="text-left p-2">{t('createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(row => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-semibold">{row.full_name}</td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{formatDate(row.last_login)}</td>
                    <td className="p-2">{formatDate(row.created_at)}</td>
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
  const { t } = useLanguage()
  const [active, setActive] = useState('health-all')
  const [selectedUser, setSelectedUser] = useState('all')
  
  // Health data states
  const [heartData, setHeartData] = useState<HeartRateMetric[]>([])
  const [oxygenData, setOxygenData] = useState<BloodOxygenMetric[]>([])
  const [pressureData, setPressureData] = useState<BloodPressureMetric[]>([])
  const [sugarData, setSugarData] = useState<BloodSugarMetric[]>([])
  const [stepsData, setStepsData] = useState<StepsMetric[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // --- Mock monitoring efficiency data (temporary) ---
  const [rangeFrom, setRangeFrom] = useState<string>(() => new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0,10))
  const [rangeTo, setRangeTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [rangeFromTime, setRangeFromTime] = useState<string>(() => '00:00')
  const [rangeToTime, setRangeToTime] = useState<string>(() => '23:59')

  // Compute per-user stats from real metrics using new efficiency formula
  // E_bracelet = K_l × K_i × K_s
  // K_l = activeTime / shiftTime (коэффициент загрузки)
  // K_i = интенсивность по среднему пульсу активных интервалов
  // K_s = штраф за риски (SpO2 < 94, HR > 130, systolic > 150)
  const computeUserStats = () => {
    const usrs = selectedUser === 'all' ? users : users.filter(u => u.id === selectedUser)
    
    // Определяем конфиг смены на основе выбранного периода
    const start = new Date(`${rangeFrom}T${rangeFromTime || '00:00'}:00Z`).getTime()
    const end = new Date(`${rangeTo}T${rangeToTime || '23:59'}:59Z`).getTime()
    const periodHours = Math.max(1, (end - start) / (1000 * 3600))
    
    const shiftConfig: ShiftConfig = {
      intervalMinutes: 15, // интервал записи данных
      shiftHours: Math.min(periodHours, 12) // максимум 12 часов смены
    }
    
    const rows = usrs.map(u => {
      // Собираем все метрики для пользователя
      const heartFor = heartData.filter(h => h.user_id === u.id)
      const stepsFor = stepsData.filter(s => s.user_id === u.id)
      const oxygenFor = oxygenData.filter(o => o.user_id === u.id)
      const pressureFor = pressureData.filter(p => p.user_id === u.id)
      
      // Преобразуем в BraceletRecord[] — объединяем по timestamp
      const timestampMap = new Map<string, BraceletRecord>()
      
      heartFor.forEach(h => {
        const ts = h.timestamp
        const existing = timestampMap.get(ts) || { timestamp: ts, heartRate: 0 }
        existing.heartRate = h.heart_rate
        timestampMap.set(ts, existing)
      })
      
      stepsFor.forEach(s => {
        const ts = s.timestamp
        const existing = timestampMap.get(ts) || { timestamp: ts, heartRate: 0 }
        existing.steps = s.steps
        timestampMap.set(ts, existing)
      })
      
      oxygenFor.forEach(o => {
        const ts = o.timestamp
        const existing = timestampMap.get(ts) || { timestamp: ts, heartRate: 0 }
        existing.spo2 = o.oxygen_saturation
        timestampMap.set(ts, existing)
      })
      
      pressureFor.forEach(p => {
        const ts = p.timestamp
        const existing = timestampMap.get(ts) || { timestamp: ts, heartRate: 0 }
        existing.systolic = p.systolic
        existing.diastolic = p.diastolic
        timestampMap.set(ts, existing)
      })
      
      const records: BraceletRecord[] = Array.from(timestampMap.values())
        .filter(r => r.heartRate > 0) // только записи с пульсом
      
      // Считаем эффективность по новой формуле
      let efficiencyResult: BraceletEfficiency
      if (records.length === 0) {
        efficiencyResult = {
          activeTimeMinutes: 0,
          loadCoefficient: 0,
          intensityCoefficient: 0.7,
          stabilityCoefficient: 1,
          braceletEfficiency: 0
        }
      } else {
        efficiencyResult = calculateBraceletEfficiency(records, shiftConfig)
      }
      
      // Средний пульс для отображения
      const avgHr = heartFor.length 
        ? Math.round(heartFor.reduce((s, x) => s + x.heart_rate, 0) / heartFor.length) 
        : 0
      
      // Шаги в час
      const totalSteps = stepsFor.reduce((s, x) => s + x.steps, 0)
      const stepsPerHour = periodHours > 0 ? Math.round(totalSteps / periodHours) : 0
      
      // Эффективность в процентах (0-100)
      const efficiencyPercent = Math.round(efficiencyResult.braceletEfficiency * 100)
      
      // Определяем статус: 90-100% эффективный, 70-90% средний, <70% неэффективный
      const status: 'efficient' | 'medium' | 'inefficient' = 
        efficiencyPercent >= 90 ? 'efficient' : 
        efficiencyPercent >= 70 ? 'medium' : 
        'inefficient'
      
      return {
        id: u.id,
        name: u.full_name,
        email: u.email,
        avgHr: avgHr || null,
        stepsPerHour: stepsPerHour || null,
        efficiency: efficiencyPercent,
        status, // 'efficient' | 'medium' | 'inefficient'
        isEfficient: efficiencyPercent >= 90, // для обратной совместимости
        // Детали для отладки/отображения
        activeMinutes: efficiencyResult.activeTimeMinutes,
        loadCoef: efficiencyResult.loadCoefficient,
        intensityCoef: efficiencyResult.intensityCoefficient,
        stabilityCoef: efficiencyResult.stabilityCoefficient
      }
    })
    return rows
  }

  // (kept worker export removed — using device export for real metrics)

  const exportUsersToCsv = (rows: any[]) => {
    const headers = ['User ID','Name','Email','Avg HR','Steps/hour','Status','Efficiency%']
    const lines = rows.map(r => {
      const cols = [r.id, r.name, r.email ?? '-', r.avgHr ?? '-', r.stepsPerHour ?? '-', r.isEfficient ? t('efficient') : t('inefficient'), r.efficiency ?? '-']
      return cols.map((v: any) => `"${String(v ?? '')}"`).join(';')
    })
    const csv = [headers.join(';'), ...lines].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const namePart = selectedUser === 'all' ? 'all_users' : selectedUser
    a.href = url
    const fromPart = `${rangeFrom}_${rangeFromTime}`
    const toPart = `${rangeTo}_${rangeToTime}`
    a.download = `users_${namePart}_${fromPart}_${toPart}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Загрузка данных при переключении раздела
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        if (active === 'health-all') {
          const userFilter = selectedUser === 'all' ? undefined : selectedUser
          // Не фильтруем по дате для health-all - показываем все данные
          const fromIso = undefined
          const toIso = undefined

          const [heart, oxygen, pressure, sugar, steps, usrs] = await Promise.all([
            getHeartRateMetrics(userFilter, undefined, fromIso, toIso),
            getBloodOxygenMetrics(userFilter, undefined, fromIso, toIso),
            getBloodPressureMetrics(userFilter, undefined, fromIso, toIso),
            getBloodSugarMetrics(userFilter, undefined, fromIso, toIso),
            getStepsMetrics(userFilter, undefined, fromIso, toIso),
            getUsers()
          ])
          setHeartData(heart)
          setOxygenData(oxygen)
          setPressureData(pressure)
          setSugarData(sugar)
          setStepsData(steps)
          setUsers(usrs)
          console.log('Loaded users:', usrs.length, usrs)

        } else if (active === 'ww-watch') {
          const usrs = await getUsers()
          console.log('Loaded users (ww-watch):', usrs.length, usrs)
          setUsers(usrs)
        } else if (active === 'health-efficiency') {
          // Fetch users and metric slices for efficiency monitoring
          const userFilter = selectedUser === 'all' ? undefined : selectedUser
          const fromIso = rangeFrom ? `${rangeFrom}T${(rangeFromTime || '00:00')}:00Z` : undefined
          const toIso = rangeTo ? `${rangeTo}T${(rangeToTime || '23:59')}:59Z` : undefined
          const [heart, steps, oxygen, pressure, sugar, usrs] = await Promise.all([
            getHeartRateMetrics(userFilter, undefined, fromIso, toIso),
            getStepsMetrics(userFilter, undefined, fromIso, toIso),
            getBloodOxygenMetrics(userFilter, undefined, fromIso, toIso),
            getBloodPressureMetrics(userFilter, undefined, fromIso, toIso),
            getBloodSugarMetrics(userFilter, undefined, fromIso, toIso),
            getUsers()
          ])
          
          setHeartData(heart)
          setStepsData(steps)
          setOxygenData(oxygen)
          setPressureData(pressure)
          setSugarData(sugar)
          setUsers(usrs)
          console.log('Loaded users (efficiency):', usrs.length, usrs)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (['health-all', 'ww-watch', 'health-efficiency'].includes(active)) {
      loadData()
    }
  }, [active, selectedUser, rangeFrom, rangeTo, rangeFromTime, rangeToTime, refreshTrigger])

  if (authLoading) return <div className="p-6">{t('loading')}</div>
  if (!user) return <Navigate to="/login" replace />

  function renderContent() {
    if (loading) return <div className="p-6">{t('loadingData')}</div>
    
    switch (active) {
      case 'health-all':
        return <HealthAllView 
          heartData={heartData}
          oxygenData={oxygenData}
          pressureData={pressureData}
          sugarData={sugarData}
          stepsData={stepsData}
          users={users}
          loading={loading}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      case 'health-efficiency':
        return (
          <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold">{t('efficiencyMonitoring')}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-3 bg-background/50 p-2 rounded-md border">
                    <span className="text-sm text-muted-foreground">{t('period')}</span>
                    <div className="flex items-center gap-2">
                      <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <input type="time" value={rangeFromTime} onChange={e => setRangeFromTime(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <span className="text-sm text-muted-foreground">—</span>
                      <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      <input type="time" value={rangeToTime} onChange={e => setRangeToTime(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" />
                      
                      <button
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="ml-2 inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-semibold hover:bg-brand/90 transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {t('apply')}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-background/50 p-2 rounded-md border">
                    <label className="text-sm text-muted-foreground">{t('user')}</label>
                    <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm min-w-[180px]">
                      <option value="all">{t('allUsers')}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const rows = computeUserStats()
                      exportUsersToCsv(rows)
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
                    {t('export')}
                  </button>
                </div>
              </div>

            {/* removed specMetrics card as requested */}

            <Card>
              <CardHeader>
                <CardTitle>{t('usersList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">{t('fullName')}</th>
                        <th className="text-left p-2">{t('email')}</th>
                        <th className="text-left p-2">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* If we have real metrics, compute per-user stats */}
                      {(() => {
                        const rows = computeUserStats()
                        return rows.map(r => (
                          <tr key={r.id} className="border-b">
                            <td className="p-2 font-mono text-xs">{r.id}</td>
                            <td className="p-2">{r.name}</td>
                            <td className="p-2">{r.email}</td>
                            <td className="p-2">
                              {r.status === 'efficient' ? (
                                <span className="inline-block px-2 py-1 rounded text-sm bg-green-100 text-green-800 font-bold">{t('efficient')}</span>
                              ) : r.status === 'medium' ? (
                                <span className="inline-block px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800 font-bold">{t('medium')}</span>
                              ) : (
                                <span className="inline-block px-2 py-1 rounded text-sm bg-red-100 text-red-800 font-bold">{t('inefficient')}</span>
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
            
          </div>
        )
      case 'ww-watch':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t('users')}</CardTitle>
              <CardDescription>{t('totalUsers')}: {users.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('fullName')}</th>
                      <th className="text-left p-2">{t('email')}</th>
                      <th className="text-left p-2">{t('lastLogin')}</th>
                      <th className="text-left p-2">{t('createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(row => (
                      <tr key={row.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-semibold">{row.full_name}</td>
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{formatDate(row.last_login)}</td>
                        <td className="p-2">{formatDate(row.created_at)}</td>
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
