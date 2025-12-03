import * as React from "react"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

type Slice = { name: string; value: number; color: string }

const defaultData: Slice[] = [
  { name: "Работа", value: 24.3, color: "hsl(var(--primary))" },
  { name: "Простой", value: 67.9, color: "hsl(var(--accent))" },
  { name: "Перемещение", value: 7.8, color: "hsl(var(--muted-foreground))" },
]

export function PieActivity({ title = "Средняя активность группы за период", data = defaultData }: { title?: string; data?: Slice[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>Ввод данных • По дням</CardDescription>
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(v: any) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
