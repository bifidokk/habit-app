"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { isHabitActiveToday, isHabitCompletedToday } from "@/lib/storage"
import type { Habit } from "@/types/habit"
import { CheckCircle2, Circle, Clock } from "lucide-react"

export function TodaySummary({ habits }: { habits: Habit[] }) {
  const todayStats = useMemo(() => {
    const activeToday = habits.filter(isHabitActiveToday)
    const completedToday = activeToday.filter(isHabitCompletedToday)
    const completionRate = activeToday.length > 0 ? Math.round((completedToday.length / activeToday.length) * 100) : 0

    return {
      total: activeToday.length,
      completed: completedToday.length,
      remaining: activeToday.length - completedToday.length,
      completionRate,
      activeHabits: activeToday,
    }
  }, [habits])

  if (todayStats.total === 0) {
    return (
      <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No habits scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="tracking-tight">Today's Progress</CardTitle>
          <Badge variant={todayStats.completionRate === 100 ? "default" : "secondary"} className="rounded-full">
            {todayStats.completed}/{todayStats.total}
          </Badge>
        </div>
        <CardDescription>
          {todayStats.remaining === 0
            ? "🎉 All habits completed today!"
            : `${todayStats.remaining} habit${todayStats.remaining === 1 ? "" : "s"} remaining`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Completion Rate</span>
            <span className="font-medium">{todayStats.completionRate}%</span>
          </div>
          <Progress value={todayStats.completionRate} className="h-2" />
        </div>

        <div className="space-y-2">
          {todayStats.activeHabits.map((habit) => {
            const isCompleted = isHabitCompletedToday(habit)
            return (
              <div key={habit.id} className="flex items-center gap-2 text-sm">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={isCompleted ? "text-green-400" : "text-foreground"}>{habit.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {habit.time}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
