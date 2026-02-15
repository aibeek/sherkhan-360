"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TimePicker24Props {
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

export function TimePicker24({ value, onChange, className, id }: TimePicker24Props) {
  const [h, m] = value.split(":")
  const hour = (h && /^\d{1,2}$/.test(h) ? h.padStart(2, "0") : "00").slice(0, 2)
  const minute = (m && /^\d{1,2}$/.test(m) ? m.padStart(2, "0") : "00").slice(0, 2)

  const setHour = (v: string) => onChange(`${v}:${minute}`)
  const setMinute = (v: string) => onChange(`${hour}:${v}`)

  const hourNum = Math.min(23, Math.max(0, parseInt(hour, 10) || 0))
  const minuteNum = Math.min(59, Math.max(0, parseInt(minute, 10) || 0))

  return (
    <div
      id={id}
      className={cn(
        "inline-flex h-10 items-center gap-0.5 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      <select
        aria-label="Часы"
        value={String(hourNum).padStart(2, "0")}
        onChange={(e) => setHour(e.target.value)}
        className="h-8 min-w-0 border-0 bg-transparent py-0 pl-1 pr-0 text-right outline-none [&>option]:text-foreground"
      >
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>
            {hh}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground">:</span>
      <select
        aria-label="Минуты"
        value={String(minuteNum).padStart(2, "0")}
        onChange={(e) => setMinute(e.target.value)}
        className="h-8 min-w-0 border-0 bg-transparent py-0 pl-0 pr-1 text-right outline-none [&>option]:text-foreground"
      >
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
    </div>
  )
}
