import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip } from "recharts"

export type ChartConfig = Record<string, { label: string; color?: string }>

export function ChartContainer({
  config,
  className,
  style,
  children
}: {
  config: ChartConfig
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const vars: React.CSSProperties = { ...style }
  for (const [key, conf] of Object.entries(config)) {
    if (conf.color) (vars as any)[`--color-${key}`] = conf.color
  }
  return (
    <div className={cn("relative", className)} style={vars}>
      {children}
    </div>
  )
}

export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip {...props} />
}

export type ChartTooltipContentProps = {
  className?: string
  nameKey?: string
  labelFormatter?: (value: any) => string
  active?: boolean
  payload?: any[]
  label?: any
}

export function ChartTooltipContent({
  className,
  nameKey,
  labelFormatter,
  active,
  payload,
  label
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null
  const displayLabel = labelFormatter ? labelFormatter(label) : String(label ?? "")
  return (
    <div className={cn("rounded-md border bg-popover px-3 py-2 text-sm shadow-md", className)}>
      <div className="mb-1 font-medium">{displayLabel}</div>
      <div className="grid gap-1">
        {payload.map((item: any) => (
          <div key={String(item.dataKey)} className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {nameKey ?? (item.name ?? String(item.dataKey))}
            </span>
            <span style={{ color: item.color || undefined }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
