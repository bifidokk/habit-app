"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { habitColorWithOpacity } from "@/lib/habit-colors"
import { isHabitCompletedToday, completeHabit, getTodayDateString } from "@/lib/storage"
import { DayDots } from "@/components/habits/day-dots"
import type { Habit } from "@/types/habit"

interface HabitCardProps {
  habit: Habit
  onTap: () => void
  onCompleted: () => void
}

function getStreak(habit: Habit): number {
  if (!habit.completions?.length) return 0
  const sorted = habit.completions
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()
    .reverse()

  const today = getTodayDateString()
  let streak = 0
  const d = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split("T")[0]
    if (sorted.includes(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
    d.setDate(d.getDate() - 1)
  }

  return streak
}

export function HabitCard({ habit, onTap, onCompleted }: HabitCardProps) {
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

  // Split emoji from name
  const emojiMatch = habit.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  const emoji = emojiMatch ? emojiMatch[0].trim() : null
  const nameWithoutEmoji = emojiMatch ? habit.name.slice(emojiMatch[0].length) : habit.name

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
          {streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : ""}
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
      <DayDots activeDays={habit.days} color={color} />
    </div>
  )
}
