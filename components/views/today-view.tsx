"use client"

import { Plus, MessageCircle } from "lucide-react"
import { HabitCard } from "@/components/habits/habit-card"
import { HabitStatusAlerts } from "@/components/habits/habit-status-alerts"
import { useLocale } from "@/contexts/locale-context"
import type { Habit } from "@/types/habit"

interface TodayViewProps {
  habits: Habit[]
  backendHealthy: boolean | null
  error: string | null
  onOpenNewHabit: () => void
  onTapHabit: (habitId: string) => void
  onHabitCompleted: () => void
}

export function TodayView({
  habits,
  backendHealthy,
  error,
  onOpenNewHabit,
  onTapHabit,
  onHabitCompleted,
}: TodayViewProps) {
  const { t } = useLocale()

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{t('today.title')}</h1>
        <button
          onClick={onOpenNewHabit}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
          aria-label={t('habits.addLabel')}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <HabitStatusAlerts backendHealthy={backendHealthy} error={error} />

      {/* Cards grid */}
      {habits.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onTap={() => onTapHabit(habit.id)}
              onCompleted={onHabitCompleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-1">{t('today.noHabits')}</p>
          <p className="text-sm">{t('today.addFirst')}</p>
          <a
            href="https://t.me/habitsupportbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('today.needHelp')}
          </a>
        </div>
      )}

      {/* Support link */}
      <a
        href="https://t.me/habitsupportbot"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 mt-6 text-sm text-muted-foreground hover:text-purple-400 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {t('today.support')}
      </a>
    </div>
  )
}
