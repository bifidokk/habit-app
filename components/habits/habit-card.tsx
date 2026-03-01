"use client"

import { useMemo, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { habitColorWithOpacity } from "@/lib/habit-colors"
import { isHabitCompletedToday, completeHabit, getTodayDateString } from "@/lib/storage"
import { DayDots } from "@/components/habits/day-dots"
import { useLocale } from "@/contexts/locale-context"
import type { Habit } from "@/types/habit"

interface HabitCardProps {
  habit: Habit
  onTap: () => void
  onCompleted: () => void
}

function fmtLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getStreak(habit: Habit): number {
  if (!habit.completions?.length) return 0
  const completedSet = new Set(
    habit.completions.filter((c) => c.completed).map((c) => c.date)
  )

  const today = new Date()
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    if (completedSet.has(fmtLocal(d))) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export function HabitCard({ habit, onTap, onCompleted }: HabitCardProps) {
  const { t } = useLocale()
  const [completing, setCompleting] = useState(false)
  const completed = isHabitCompletedToday(habit)
  const streak = getStreak(habit)
  const color = habit.color

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (completed || completing) return
    setCompleting(true)
    try {
      const today = getTodayDateString()
      await completeHabit(habit.id, today)
      onCompleted()
    } catch (error) {
      console.error("Failed to complete habit:", error)
    } finally {
      setCompleting(false)
    }
  }

  // Compute which days of the current week (Mon-Sun) were completed
  const completedDaysThisWeek = useMemo(() => {
    if (!habit.completions?.length) return []
    const today = new Date()
    const jsDay = today.getDay()
    // Monday of this week
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (jsDay === 0 ? 6 : jsDay - 1))

    const completedSet = new Set(
      habit.completions.filter((c) => c.completed).map((c) => c.date)
    )

    const days: number[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (completedSet.has(dateStr)) {
        days.push(i) // 0=Mon..6=Sun (backend format)
      }
    }
    return days
  }, [habit.completions])

  // Split emoji from name
  const emojiMatch = habit.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  const emoji = emojiMatch ? emojiMatch[0].trim() : null
  const nameWithoutEmoji = emojiMatch ? habit.name.slice(emojiMatch[0].length) : habit.name

  const streakLabel = streak === 1 ? t('card.day') : t('card.days')

  return (
    <div
      onClick={onTap}
      className="relative rounded-2xl p-3.5 cursor-pointer transition-all duration-200 active:scale-[0.97] border"
      style={{
        backgroundColor: habitColorWithOpacity(color, 0.12),
        borderColor: habitColorWithOpacity(color, 0.25),
      }}
    >
      {/* Top row: streak + check */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {`${streak} ${streakLabel}`}
        </span>
        <button
          onClick={handleComplete}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 border-2",
            completed
              ? "text-white"
              : "border-white/30 hover:border-white/50"
          )}
          style={
            completed
              ? { backgroundColor: color, borderColor: color }
              : undefined
          }
          aria-label={completed ? "Completed" : "Mark as complete"}
        >
          <Check className={cn("w-4 h-4", completing && "animate-pulse")} />
        </button>
      </div>

      {/* Center: emoji + name */}
      <div className="mb-3">
        {emoji && <div className="text-2xl mb-1">{emoji}</div>}
        <div className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
          {nameWithoutEmoji}
        </div>
      </div>

      {/* Bottom: day dots */}
      <DayDots completedDays={completedDaysThisWeek} color={color} />
    </div>
  )
}
