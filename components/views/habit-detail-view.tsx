"use client"

import { useMemo } from "react"
import { ArrowLeft, Pencil } from "lucide-react"
import { HabitHeatmap } from "@/components/habits/habit-heatmap"
import type { Habit } from "@/types/habit"
import { habitColorWithOpacity } from "@/lib/habit-colors"

interface HabitDetailViewProps {
  habit: Habit
  onBack: () => void
  onEdit: () => void
}

function getStreak(habit: Habit): number {
  if (!habit.completions?.length) return 0
  const completed = habit.completions
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort()
    .reverse()

  const today = new Date().toISOString().split("T")[0]
  let streak = 0
  const d = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split("T")[0]
    if (completed.includes(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
    d.setDate(d.getDate() - 1)
  }

  return streak
}

export function HabitDetailView({ habit, onBack, onEdit }: HabitDetailViewProps) {
  const color = habit.color

  const stats = useMemo(() => {
    const completions = habit.completions?.filter((c) => c.completed) || []
    const totalCompleted = completions.length

    const now = new Date()
    const createdAt = new Date(habit.createdAt)
    const daysSinceCreation = Math.max(1, Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    const weeksSinceCreation = Math.max(1, Math.ceil(daysSinceCreation / 7))
    const monthsSinceCreation = Math.max(1, Math.ceil(daysSinceCreation / 30))

    // Calculate total scheduled days
    const totalScheduledDays = Math.max(1, Math.round(daysSinceCreation * (habit.days.length / 7)))

    const dayRate = Math.min(100, Math.round((totalCompleted / totalScheduledDays) * 100))
    const weekRate = dayRate // simplified
    const monthRate = dayRate

    return {
      streak: getStreak(habit),
      totalCompleted,
      dayRate,
      weekRate,
      monthRate,
      daysSinceCreation,
      weeksSinceCreation,
      monthsSinceCreation,
    }
  }, [habit])

  // Split emoji from name
  const emojiMatch = habit.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  const emoji = emojiMatch ? emojiMatch[0].trim() : null
  const nameWithoutEmoji = emojiMatch ? habit.name.slice(emojiMatch[0].length) : habit.name

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={onEdit} className="flex items-center gap-1 text-sm text-muted-foreground">
          <Pencil className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        {emoji && <div className="text-5xl mb-2">{emoji}</div>}
        <h1 className="text-xl font-bold">{nameWithoutEmoji}</h1>
        {stats.streak > 0 && (
          <p className="text-sm mt-1" style={{ color }}>
            {stats.streak} day streak
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Days", rate: stats.dayRate, count: stats.totalCompleted },
          { label: "Weeks", rate: stats.weekRate, count: stats.weeksSinceCreation },
          { label: "Months", rate: stats.monthRate, count: stats.monthsSinceCreation },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center border"
            style={{
              backgroundColor: habitColorWithOpacity(color, 0.1),
              borderColor: habitColorWithOpacity(color, 0.2),
            }}
          >
            <div className="text-2xl font-bold">{stat.rate}%</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4">
        <HabitHeatmap habit={habit} color={color} />
      </div>
    </div>
  )
}
