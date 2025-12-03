import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PieActivity } from '@/components/charts/PieActivity'
import { RankingBar } from '@/components/charts/RankingBar'

function Sidebar() {
  const [openPeople, setOpenPeople] = useState(true)
  const [openAnalytics, setOpenAnalytics] = useState(true)
  const [openDevices, setOpenDevices] = useState(true)
  const [active, setActive] = useState<string>('analytics')
  return (
    <aside className="w-64 shrink-0 border-r bg-background">
      <div className="p-4">
        <div className="text-lg font-semibold">Админ панель</div>
      </div>
      <nav className="px-3 pb-4 space-y-2">
        <SectionHeader onClick={() => setOpenPeople(v => !v)} open={openPeople} title="Люди и события" />
        {openPeople && (
          <div className="space-y-1">
            <NavItem icon={<ClockIcon />} label="Сейчас на смене" active={active==='shift-now'} onClick={() => setActive('shift-now')} />
            <NavItem icon={<UsersIcon />} label="Сотрудники" active={active==='employees'} onClick={() => setActive('employees')} />
            <NavItem icon={<CalendarIcon />} label="Смены" active={active==='shifts'} onClick={() => setActive('shifts')} />
          </div>
        )}
        <div className="border-t" />
        <SectionHeader onClick={() => setOpenAnalytics(v => !v)} open={openAnalytics} title="Аналитические данные" />
        {openAnalytics && (
          <div className="space-y-1">
            <NavItem icon={<PieChartIcon />} label="Аналитика" active={active==='analytics'} onClick={() => setActive('analytics')} />
            <NavItem icon={<FileTextIcon />} label="Отчёты" active={active==='reports'} onClick={() => setActive('reports')} />
            <NavItem icon={<TableIcon />} label="Таблицы" active={active==='tables'} onClick={() => setActive('tables')} />
            <NavItem icon={<SettingsIcon />} label="Свойства" active={active==='props'} onClick={() => setActive('props')} />
          </div>
        )}
        <div className="border-t" />
        <SectionHeader onClick={() => setOpenDevices(v => !v)} open={openDevices} title="Устройства" />
        {openDevices && (
          <div className="space-y-1">
            <NavItem icon={<WatchIcon />} label="Часы WW" active={active==='ww-watch'} onClick={() => setActive('ww-watch')} />
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

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarFixed />
      <main className="pl-64">
        <div className="p-6 max-w-7xl">
          <ToolbarCard />

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PieActivity />
            <RankingBar />
          </div>

          <Card className="mt-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Статистика эффективности</CardTitle>
              <CardDescription>Ключевые  метрики</CardDescription>
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
        </div>
      </main>
    </div>
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

function SidebarFixed() {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 border-r bg-background">
      <Sidebar />
    </aside>
  )
}

function ToolbarCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <Toolbar />
      </CardContent>
    </Card>
  )
}
