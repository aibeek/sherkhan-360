import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type Item = { name: string; id: string; work: number; idle: number; move: number; efficient?: boolean }

const defaultData: Item[] = [
  { name: "Борисов Даниил Александрович", id: "BR-001", work: 68, idle: 2, move: 30, efficient: true },
  { name: "Якуш Роман Тимофеевич", id: "BR-002", work: 62, idle: 3, move: 35, efficient: true },
  { name: "Салах Кайрат Талгатович", id: "BR-003", work: 45, idle: 10, move: 45 },
  { name: "Сомонов Николай Сергеевич", id: "BR-004", work: 60, idle: 0, move: 40, efficient: true },
  { name: "Хабибуллин Дамир Азатович", id: "BR-005", work: 38, idle: 6, move: 56 },
  { name: "Ниязов Руслан", id: "BR-006", work: 34, idle: 12, move: 54 },
  { name: "Левитан Дмитрий Олегович", id: "BR-007", work: 25, idle: 20, move: 55 },
]

export function RankingBar({ title = "Рейтинг эффективности за период", data = defaultData }: { title?: string; data?: Item[] }) {
  const chartData = React.useMemo(
    () => data.map(d => ({ ...d, label: `${d.name} • ID: ${d.id}${d.efficient ? " ★" : ""}` })),
    [data]
  )

  function YTick(props: any) {
    const { x, y, payload } = props
    const raw: string = String(payload?.value ?? "")
    const efficient = raw.includes("★")
    const [namePart, idPart] = raw.replace(" ★", "").split(" • ID: ")
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dx={-6} dy={3} fontSize={13} textAnchor="end" fill="currentColor">{namePart}</text>
        <text x={0} y={0} dx={-6} dy={18} fontSize={11} textAnchor="end" fill="hsl(var(--muted-foreground))">{`ID: ${idPart || ""}`}{efficient ? " ★" : ""}</text>
      </g>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">Всего сотрудников: {data.length}</div>
      </CardHeader>
      <CardContent className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 18, right: 16, top: 8, bottom: 8 }} barCategoryGap={8} barSize={22}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="label" tick={<YTick />} width={240} axisLine={false} tickLine={false} />
            <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent className="w-[160px]" labelFormatter={(lbl) => String(lbl).split(" • ")[0]} />} />
            <Bar dataKey="work" stackId="a" fill="hsl(var(--foreground))" />
            <Bar dataKey="idle" stackId="a" fill="hsl(var(--accent))" />
            <Bar dataKey="move" stackId="a" fill="hsl(var(--secondary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
