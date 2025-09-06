"use client"

import { useMemo } from "react"
import { cn, jsDayToBackendDay } from "@/lib/utils"
import type { Habit } from "@/types/habit"

interface HeatmapDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
  isScheduled: boolean
  isCompleted: boolean
  dayOfWeek: number
}

// Helper function to format date as YYYY-MM-DD in local timezone
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

      // Add only actual month days
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
        const dateStr = formatDateLocal(date)
        const dayOfWeek = date.getDay()

        monthDays.push({
          date: dateStr,
          dayOfMonth: day,
          isCurrentMonth: true,
          isScheduled: habit.days.includes(jsDayToBackendDay(dayOfWeek)),
          isCompleted: completionMap.get(dateStr) || false,
          dayOfWeek,
        })
      }

      months.push(monthDays)
    }

    return months
  }, [habit])

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="space-y-6">
      {heatmapData.slice().reverse().map((monthDays, monthIndex) => {
        const monthDate = new Date()
        monthDate.setMonth(monthDate.getMonth() - (2 - (heatmapData.length - 1 - monthIndex)))
        const monthName = monthNames[monthDate.getMonth()]

        // Group days into weeks, handling months that don't start on Monday
        const weeks: HeatmapDay[][] = []
        const firstDayOfWeek = monthDays.length > 0 ? new Date(monthDays[0].date).getDay() : 0
        const daysToPad = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
        
        // Add empty cells for days before the first day of the month
        const firstWeek: HeatmapDay[] = []
        for (let i = 0; i < daysToPad; i++) {
          firstWeek.push({
            date: '',
            dayOfMonth: 0,
            isCurrentMonth: false,
            isScheduled: false,
            isCompleted: false,
            dayOfWeek: i,
          })
        }
        
        // Add the actual month days
        firstWeek.push(...monthDays.slice(0, 7 - daysToPad))
        weeks.push(firstWeek)
        
        // Add remaining weeks
        for (let i = 7 - daysToPad; i < monthDays.length; i += 7) {
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
                    const isToday = day.date === formatDateLocal(new Date())

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "w-6 h-6 rounded-md transition-all duration-200 border-2 relative group cursor-pointer",
                          // Empty cells (padding)
                          !day.date && "opacity-0",
                          // Not scheduled days
                          day.date && !day.isScheduled && "bg-muted/20 border-muted-foreground/10 hover:border-muted-foreground/20",
                          // Scheduled but not completed (missed)
                          day.date && day.isScheduled && !day.isCompleted && "bg-muted/40 border-purple-300/40 hover:border-purple-300/60",
                          // Completed days - purple gradient
                          day.date && day.isScheduled && day.isCompleted && "bg-gradient-to-br from-purple-500 to-violet-500 border-purple-400 shadow-sm shadow-purple-500/20 hover:shadow-md hover:shadow-purple-500/30 hover:scale-105",
                          // Today indicator
                          isToday && "ring-2 ring-purple-300/50 ring-offset-1 ring-offset-background",
                        )}
                        title={`${day.date}: ${
                          !day.isScheduled ? "Not scheduled" : day.isCompleted ? "Completed ✓" : "Not completed"
                        }`}
                      >
                        {/* Day number for current month */}
                        {day.date && (
                          <span
                            className={cn(
                              "absolute inset-0 flex items-center justify-center text-xs font-medium transition-colors",
                              day.isScheduled && day.isCompleted ? "text-white" : "text-muted-foreground",
                            )}
                          >
                            {day.dayOfMonth}
                          </span>
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
            <div className="w-4 h-4 rounded-md bg-muted/40 border-2 border-purple-300/40"></div>
            <span className="text-muted-foreground">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-purple-500 to-violet-500 border-2 border-purple-400 shadow-sm shadow-purple-500/20"></div>
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
