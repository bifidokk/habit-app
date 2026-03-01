"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn, jsDayToBackendDay } from "@/lib/utils"
import { habitColorWithOpacity } from "@/lib/habit-colors"
import { useLocale } from "@/contexts/locale-context"
import { getMonthNames } from "@/lib/i18n"
import type { Habit } from "@/types/habit"

const DAY_HEADERS = ["M", "T", "W", "T", "F", "S", "S"]

function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

interface MonthCalendarProps {
  habit: Habit
  color: string
  onDayToggle?: (date: string, completed: boolean) => void
}

interface DayCell {
  date: string
  dayOfMonth: number
  inMonth: boolean
  isScheduled: boolean
  isCompleted: boolean
  isToday: boolean
}

function buildMonth(year: number, month: number, habit: Habit, optimistic: Map<string, boolean>): DayCell[] {
  const completionMap = new Map(
    (habit.completions || []).map((c) => [c.date, c.completed])
  )
  // Apply optimistic overrides
  for (const [date, completed] of optimistic) {
    completionMap.set(date, completed)
  }
  const todayStr = formatDateLocal(new Date())

  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  // Pad start: days from previous month to fill first week row (Mon start)
  const startDow = firstOfMonth.getDay() // 0=Sun
  const padBefore = startDow === 0 ? 6 : startDow - 1

  // Pad end: fill last row to 7
  const totalCells = padBefore + lastOfMonth.getDate()
  const padAfter = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)

  const cells: DayCell[] = []

  // Previous month days
  for (let i = padBefore - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const dateStr = formatDateLocal(d)
    cells.push({
      date: dateStr,
      dayOfMonth: d.getDate(),
      inMonth: false,
      isScheduled: habit.days.includes(jsDayToBackendDay(d.getDay())),
      isCompleted: completionMap.get(dateStr) || false,
      isToday: dateStr === todayStr,
    })
  }

  // Current month days
  for (let day = 1; day <= lastOfMonth.getDate(); day++) {
    const d = new Date(year, month, day)
    const dateStr = formatDateLocal(d)
    cells.push({
      date: dateStr,
      dayOfMonth: day,
      inMonth: true,
      isScheduled: habit.days.includes(jsDayToBackendDay(d.getDay())),
      isCompleted: completionMap.get(dateStr) || false,
      isToday: dateStr === todayStr,
    })
  }

  // Next month days
  for (let i = 1; i <= padAfter; i++) {
    const d = new Date(year, month + 1, i)
    const dateStr = formatDateLocal(d)
    cells.push({
      date: dateStr,
      dayOfMonth: d.getDate(),
      inMonth: false,
      isScheduled: habit.days.includes(jsDayToBackendDay(d.getDay())),
      isCompleted: completionMap.get(dateStr) || false,
      isToday: dateStr === todayStr,
    })
  }

  return cells
}

export function MonthCalendar({ habit, color, onDayToggle }: MonthCalendarProps) {
  const { t } = useLocale()
  const monthNames = getMonthNames(t)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [optimistic, setOptimistic] = useState<Map<string, boolean>>(new Map())
  const todayStr = formatDateLocal(new Date())

  // Clear optimistic overrides when habit prop updates (server data arrived)
  useEffect(() => {
    setOptimistic(new Map())
  }, [habit])

  // Swipe handling
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const goToPrev = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const goToNext = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }

  const handleDayTap = useCallback((cell: DayCell) => {
    if (!onDayToggle || !cell.inMonth || cell.date > todayStr) return
    const newCompleted = !cell.isCompleted
    // Optimistic update — instant UI
    setOptimistic((prev) => new Map(prev).set(cell.date, newCompleted))
    // Fire API in background, clear optimistic override when server confirms
    onDayToggle(cell.date, newCompleted)
  }, [onDayToggle, todayStr])

  const cells = useMemo(() => buildMonth(year, month, habit, optimistic), [year, month, habit, optimistic])
  const weeks: DayCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month header with arrows */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrev} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold">
          {monthNames[month]} {year}
        </h3>
        <button onClick={goToNext} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((cell, ci) => {
            const isFuture = cell.date > todayStr
            const tappable = onDayToggle && cell.inMonth && !isFuture
            return (
              <div
                key={ci}
                className="flex items-center justify-center py-1.5"
              >
                <div
                  onClick={tappable ? () => handleDayTap(cell) : undefined}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                    !cell.inMonth && "opacity-30",
                    cell.isToday && !cell.isCompleted && "ring-1 ring-offset-1 ring-offset-background",
                    tappable && "cursor-pointer active:scale-95 transition-transform",
                  )}
                  style={{
                    ...(cell.isScheduled && cell.isCompleted
                      ? { backgroundColor: habitColorWithOpacity(color, 0.35), color: color }
                      : {}),
                    ...(cell.isToday && !cell.isCompleted
                      ? { borderColor: color, ringColor: color }
                      : {}),
                    ...(cell.isToday
                      ? { outlineColor: color }
                      : {}),
                  }}
                >
                  {cell.dayOfMonth}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
