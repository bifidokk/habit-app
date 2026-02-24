"use client"

import { cn } from "@/lib/utils"
import { jsDayToBackendDay } from "@/lib/utils"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

interface DayDotsProps {
  activeDays: number[] // backend days 0=Mon..6=Sun
  color: string
}

export function DayDots({ activeDays, color }: DayDotsProps) {
  const todayBackend = jsDayToBackendDay(new Date().getDay())

  return (
    <div className="flex gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const isActive = activeDays.includes(i)
        const isToday = i === todayBackend

        return (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
              isToday && isActive
                ? "text-white"
                : isActive
                  ? "text-white/80"
                  : "text-muted-foreground/40 bg-white/5"
            )}
            style={
              isToday && isActive
                ? { backgroundColor: color }
                : isActive
                  ? { backgroundColor: `${color}66` }
                  : undefined
            }
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}
