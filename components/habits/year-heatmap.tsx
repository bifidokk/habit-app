"use client"

import { useMemo } from "react"
import { cn, jsDayToBackendDay } from "@/lib/utils"
import { habitColorWithOpacity } from "@/lib/habit-colors"
import type { Habit } from "@/types/habit"

function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

interface YearHeatmapProps {
  habit: Habit
  year: number
}

interface DayCell {
  date: string
  dayOfMonth: number
  isScheduled: boolean
  isCompleted: boolean
}

export function YearHeatmap({ habit, year }: YearHeatmapProps) {
  const color = habit.color

  const monthsData = useMemo(() => {
    const completionMap = new Map((habit.completions || []).map((c) => [c.date, c.completed]))
    const months: { name: string; weeks: (DayCell | null)[][] }[] = []

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      const firstDayOfWeek = monthStart.getDay()
      const pad = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

      const cells: (DayCell | null)[] = []
      for (let i = 0; i < pad; i++) cells.push(null)

      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(year, month, day)
        const dateStr = formatDateLocal(date)
        const dow = date.getDay()
        cells.push({
          date: dateStr,
          dayOfMonth: day,
          isScheduled: habit.days.includes(jsDayToBackendDay(dow)),
          isCompleted: completionMap.get(dateStr) || false,
        })
      }

      // Split into weeks
      const weeks: (DayCell | null)[][] = []
      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7))
      }

      months.push({ name: MONTH_NAMES[month], weeks })
    }

    return months
  }, [habit, year])

  const todayStr = formatDateLocal(new Date())

  return (
    <div className="grid grid-cols-3 gap-4">
      {monthsData.map((month) => (
        <div key={month.name} className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground mb-1">{month.name}</div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="text-[8px] text-muted-foreground/50 text-center">
                {d}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {month.weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-px">
              {week.map((cell, ci) => {
                if (!cell) return <div key={ci} className="w-full aspect-square" />
                const isToday = cell.date === todayStr
                return (
                  <div
                    key={ci}
                    className={cn(
                      "w-full aspect-square rounded-[2px]",
                      isToday && "ring-1 ring-white/50"
                    )}
                    style={{
                      backgroundColor:
                        cell.isScheduled && cell.isCompleted
                          ? color
                          : cell.isScheduled
                            ? habitColorWithOpacity(color, 0.15)
                            : "rgba(255,255,255,0.03)",
                    }}
                    title={`${cell.date}: ${
                      !cell.isScheduled ? "Not scheduled" : cell.isCompleted ? "Completed" : "Missed"
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
