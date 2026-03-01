"use client"

import { useCallback, useMemo } from "react"
import { ArrowLeft, Pencil } from "lucide-react"
import { MonthCalendar } from "@/components/habits/month-calendar"
import { useLocale } from "@/contexts/locale-context"
import { toggleHabit } from "@/lib/storage"
import type { Habit } from "@/types/habit"
import { habitColorWithOpacity } from "@/lib/habit-colors"

interface HabitDetailViewProps {
  habit: Habit
  onBack: () => void
  onEdit: () => void
  onHabitChanged?: () => void
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

export function HabitDetailView({ habit, onBack, onEdit, onHabitChanged }: HabitDetailViewProps) {
  const { t } = useLocale()
  const color = habit.color

  const stats = useMemo(() => {
    const completedDates = new Set(
      (habit.completions || []).filter((c) => c.completed).map((c) => c.date)
    )

    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${dd}`
    }

    // --- Days: current week (Mon-Sun), completed out of 7 ---
    const today = new Date()
    const jsDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (jsDay === 0 ? 6 : jsDay - 1))
    monday.setHours(0, 0, 0, 0)

    let daysCompleted = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      if (completedDates.has(fmt(d))) daysCompleted++
    }
    const dayRate = Math.round((daysCompleted / 7) * 100)

    // --- Weeks: last 4 weeks, a week counts if at least one day was completed ---
    let weeksCompleted = 0
    for (let w = 0; w < 4; w++) {
      const weekMonday = new Date(monday)
      weekMonday.setDate(monday.getDate() - w * 7)
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekMonday)
        d.setDate(weekMonday.getDate() + i)
        if (completedDates.has(fmt(d))) {
          weeksCompleted++
          break
        }
      }
    }
    const weekRate = Math.round((weeksCompleted / 4) * 100)

    // --- Months: last 12 months, a month counts if at least one day was completed ---
    let monthsCompleted = 0
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - m, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - m + 1, 0)
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const d = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        if (d > today) break
        if (completedDates.has(fmt(d))) {
          monthsCompleted++
          break
        }
      }
    }
    const monthRate = Math.round((monthsCompleted / 12) * 100)

    return {
      streak: getStreak(habit),
      daysCompleted,
      dayRate,
      weeksCompleted,
      weekRate,
      monthsCompleted,
      monthRate,
    }
  }, [habit])

  const handleDayToggle = useCallback(async (date: string, completed: boolean) => {
    await toggleHabit(habit.id, date, completed)
    onHabitChanged?.()
  }, [habit.id, onHabitChanged])

  // Split emoji from name
  const emojiMatch = habit.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u)
  const emoji = emojiMatch ? emojiMatch[0].trim() : null
  const nameWithoutEmoji = emojiMatch ? habit.name.slice(emojiMatch[0].length) : habit.name

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={onEdit} className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium">
          {t('common.edit')}
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {emoji && <span className="text-4xl">{emoji}</span>}
          <h1 className="text-2xl font-bold">{nameWithoutEmoji}</h1>
        </div>
        {stats.streak > 0 && (
          <p className="text-sm mt-1" style={{ color }}>
            {stats.streak} {t('detail.dayStreak')}
          </p>
        )}
      </div>

      {/* Progress section */}
      <h2 className="text-base font-bold mb-3">{t('detail.progress')}</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t('detail.days'), rate: stats.dayRate, sub: t('detail.daysOf7').replace('{n}', String(stats.daysCompleted)) },
          { label: t('detail.weeks'), rate: stats.weekRate, sub: t('detail.weeksOf4').replace('{n}', String(stats.weeksCompleted)) },
          { label: t('detail.months'), rate: stats.monthRate, sub: t('detail.monthsOf12').replace('{n}', String(stats.monthsCompleted)) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center border"
            style={{
              backgroundColor: habitColorWithOpacity(color, 0.1),
              borderColor: habitColorWithOpacity(color, 0.2),
            }}
          >
            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.rate}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Calendar section */}
      <h2 className="text-base font-bold mb-3">{t('detail.calendar')}</h2>
      <div className="rounded-2xl border border-white/10 bg-card/50 p-4">
        <MonthCalendar habit={habit} color={color} onDayToggle={handleDayToggle} />
      </div>
    </div>
  )
}
