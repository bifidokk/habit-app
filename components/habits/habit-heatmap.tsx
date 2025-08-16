"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types/habit"

interface HeatmapDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isScheduled: boolean
  isCompleted: boolean
  dayOfWeek: number
}

export function HabitHeatmap({ habit }: { habit: Habit }) {
  const heatmapData = useMemo(() => {
    const today = new Date()
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1)

    const completionMap = new Map((habit.completions || []).map((c) => [c.date, c.completed]))

    const months: HeatmapDay[][] = []

    // Generate 3 months of data
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const monthStart = new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth() + monthOffset, 1)
      const monthEnd = new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth() + monthOffset + 1, 0)

      const monthDays: HeatmapDay[] = []

      // Add padding days from previous month to start on Sunday
      const firstDayOfWeek = monthStart.getDay()
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const paddingDate = new Date(monthStart)
        paddingDate.setDate(paddingDate.getDate() - i - 1)
        const dateStr = paddingDate.toISOString().split("T")[0]
        const dayOfWeek = paddingDate.getDay()

        monthDays.push({
          date: dateStr,
          dayOfMonth: paddingDate.getDate(),
          isCurrentMonth: false,
          isScheduled: habit.days.includes(dayOfWeek),
          isCompleted: completionMap.get(dateStr) || false,
          dayOfWeek,
        })
      }

      // Add actual month days
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        const dateStr = date.toISOString().split("T")[0]
        const dayOfWeek = date.getDay()

        monthDays.push({
          date: dateStr,
          dayOfMonth: day,
          isCurrentMonth: true,
          isScheduled: habit.days.includes(dayOfWeek),
          isCompleted: completionMap.get(dateStr) || false,
          dayOfWeek,
        })
      }

      // Add padding days from next month to complete the grid
      const lastDayOfWeek = monthEnd.getDay()
      const remainingDays = 6 - lastDayOfWeek
      for (let i = 1; i <= remainingDays; i++) {
        const paddingDate = new Date(monthEnd)
        paddingDate.setDate(paddingDate.getDate() + i)
        const dateStr = paddingDate.toISOString().split("T")[0]
        const dayOfWeek = paddingDate.getDay()

        monthDays.push({
          date: dateStr,
          dayOfMonth: paddingDate.getDate(),
          isCurrentMonth: false,
          isScheduled: habit.days.includes(dayOfWeek),
          isCompleted: completionMap.get(dateStr) || false,
          dayOfWeek,
        })
      }

      months.push(monthDays)
    }

    return months
  }, [habit])

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div className="space-y-6">
      {heatmapData.map((monthDays, monthIndex) => {
        const monthDate = new Date()
        monthDate.setMonth(monthDate.getMonth() - (2 - monthIndex))
        const monthName = monthNames[monthDate.getMonth()]

        // Group days into weeks
        const weeks: HeatmapDay[][] = []
        for (let i = 0; i < monthDays.length; i += 7) {
          weeks.push(monthDays.slice(i, i + 7))
        }

        return (
          <div key={monthIndex} className="space-y-3">
            <div className="text-sm font-semibold text-foreground">
              {monthName} {monthDate.getFullYear()}
            </div>
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground text-center w-6 h-6 flex items-center justify-center font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => {
                    const isToday = day.date === new Date().toISOString().split("T")[0]

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "w-6 h-6 rounded-md transition-all duration-200 border-2 relative group cursor-pointer",
                          // Base styling
                          !day.isCurrentMonth && "opacity-20",
                          // Not scheduled days
                          !day.isScheduled &&
                            day.isCurrentMonth &&
                            "bg-muted/20 border-muted-foreground/10 hover:border-muted-foreground/20",
                          !day.isScheduled && !day.isCurrentMonth && "bg-muted/10 border-muted-foreground/5",
                          // Scheduled but not completed
                          day.isScheduled &&
                            !day.isCompleted &&
                            day.isCurrentMonth &&
                            "bg-muted/40 border-muted-foreground/20 hover:border-muted-foreground/30",
                          day.isScheduled &&
                            !day.isCompleted &&
                            !day.isCurrentMonth &&
                            "bg-muted/20 border-muted-foreground/10",
                          // Completed days - beautiful purple gradient
                          day.isScheduled &&
                            day.isCompleted &&
                            day.isCurrentMonth &&
                            "bg-gradient-to-br from-purple-500 to-fuchsia-500 border-purple-400 shadow-sm shadow-purple-500/20 hover:shadow-md hover:shadow-purple-500/30 hover:scale-105",
                          day.isScheduled &&
                            day.isCompleted &&
                            !day.isCurrentMonth &&
                            "bg-gradient-to-br from-purple-500/60 to-fuchsia-500/60 border-purple-400/60",
                          // Today indicator
                          isToday && "ring-2 ring-purple-300/50 ring-offset-1 ring-offset-background",
                        )}
                        title={`${day.date}: ${
                          !day.isScheduled ? "Not scheduled" : day.isCompleted ? "Completed ✓" : "Not completed"
                        }`}
                      >
                        {/* Day number for current month */}
                        {day.isCurrentMonth && (
                          <span
                            className={cn(
                              "absolute inset-0 flex items-center justify-center text-xs font-medium transition-colors",
                              day.isScheduled && day.isCompleted ? "text-white" : "text-muted-foreground",
                            )}
                          >
                            {day.dayOfMonth}
                          </span>
                        )}

                        {/* Completion indicator */}
                        {day.isScheduled && day.isCompleted && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Enhanced Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-muted/20 border-2 border-muted-foreground/10"></div>
            <span className="text-muted-foreground">Not scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-muted/40 border-2 border-muted-foreground/20"></div>
            <span className="text-muted-foreground">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-purple-500 to-fuchsia-500 border-2 border-purple-400 shadow-sm shadow-purple-500/20"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {habit.completions?.filter((c) => c.completed).length || 0} days completed
        </div>
      </div>
    </div>
  )
}
