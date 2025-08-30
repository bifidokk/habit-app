"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { isHabitActiveToday, isHabitCompletedToday } from "@/lib/storage"
import type { Habit } from "@/types/habit"
import { CheckCircle2, Circle, Clock, ChevronRight, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function TodaySummary({ habits }: { habits: Habit[] }) {
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set())
  const isLongName = (name: string) => name.length > 50

  const toggleNameExpansion = (habitId: string) => {
    setExpandedNames(prev => {
      const newSet = new Set(prev)
      if (newSet.has(habitId)) {
        newSet.delete(habitId)
      } else {
        newSet.add(habitId)
      }
      return newSet
    })
  }

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
            const isExpanded = expandedNames.has(habit.id)
            return (
              <div key={habit.id} className="flex items-center gap-2 text-sm">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(
                  "block transition-all duration-200 ease-in-out",
                  isExpanded 
                    ? "whitespace-normal text-foreground" 
                    : "truncate max-w-[180px] text-foreground/90"
                )} title={habit.name}>
                  {isExpanded ? habit.name : `${habit.name.substring(0, 50)}${habit.name.length > 50 ? "..." : ""}`}
                </span>
                {isLongName(habit.name) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNameExpansion(habit.id)}
                    className={cn(
                      "h-6 w-6 p-0 rounded-full transition-all duration-200",
                      isExpanded
                        ? "text-foreground bg-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                    )}
                  </Button>
                )}
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
