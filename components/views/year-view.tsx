"use client"

import { useState, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { YearHeatmap } from "@/components/habits/year-heatmap"
import { useLocale } from "@/contexts/locale-context"
import type { Habit } from "@/types/habit"

interface YearViewProps {
  habits: Habit[]
}

export function YearView({ habits }: YearViewProps) {
  const { t } = useLocale()
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const selectedHabit = useMemo(() => {
    if (habits.length === 0) return null
    if (selectedHabitId) {
      return habits.find((h) => h.id === selectedHabitId) || habits[0]
    }
    return habits[0]
  }, [habits, selectedHabitId])

  if (habits.length === 0) {
    return (
      <div className="px-4 pt-4 pb-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-8">{t('year.title')}</h1>
        <p className="text-muted-foreground">{t('year.noHabits')}</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight">{t('year.title')}</h1>
        <span className="text-sm text-muted-foreground">{currentYear}</span>
      </div>

      {/* Habit switcher */}
      {habits.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl bg-white/5 border border-white/10 w-full"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedHabit?.color }}
            />
            <span className="truncate">{selectedHabit?.name}</span>
            <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-background border border-white/10 rounded-xl shadow-lg overflow-hidden">
              {habits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setSelectedHabitId(h.id)
                    setDropdownOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="truncate">{h.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single habit name when only one */}
      {habits.length === 1 && (
        <div className="flex items-center gap-2 mb-4 text-sm font-medium">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedHabit?.color }}
          />
          <span>{selectedHabit?.name}</span>
        </div>
      )}

      {/* Year heatmap */}
      {selectedHabit && (
        <div className="rounded-2xl border border-white/10 bg-card/50 p-4">
          <YearHeatmap habit={selectedHabit} year={currentYear} />
        </div>
      )}
    </div>
  )
}
