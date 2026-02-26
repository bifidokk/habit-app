"use client"

import { cn } from "@/lib/utils"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

interface DayDotsProps {
  completedDays: number[] // backend days 0=Mon..6=Sun that were completed this week
  color: string
}

export function DayDots({ completedDays, color }: DayDotsProps) {
  return (
    <div className="flex gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const isCompleted = completedDays.includes(i)

        return (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
              isCompleted
                ? "text-white"
                : "text-muted-foreground/40 bg-white/5"
            )}
            style={
              isCompleted
                ? { backgroundColor: color }
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
