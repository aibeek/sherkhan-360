"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ru } from "react-day-picker/locale"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      showOutsideDays={showOutsideDays}
      className={cn("rounded-lg border bg-popover p-3 text-popover-foreground shadow-md", className)}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
