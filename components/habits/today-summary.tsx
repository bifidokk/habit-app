"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isHabitActiveToday, isHabitCompletedToday, completeHabit, getTodayDateString } from "@/lib/storage"
import type { Habit } from "@/types/habit"
import { Clock, ChevronRight, ChevronUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function TodaySummary({ 
  habits,
  onHabitCompleted 
}: { 
  habits: Habit[]
  onHabitCompleted?: () => void
}) {
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

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const today = getTodayDateString()
      await completeHabit(habitId, today)
      
      // Notify parent component that habit was completed (just refresh the list)
      if (onHabitCompleted) {
        onHabitCompleted()
      }
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
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
          <Badge 
            variant="secondary" 
            className={cn(
              "rounded-full",
              todayStats.completionRate === 100 && "bg-purple-500/90 text-white border-purple-500/90"
            )}
          >
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
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-purple-500/20">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${todayStats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {todayStats.activeHabits.map((habit) => {
            const isCompleted = isHabitCompletedToday(habit)
            const isExpanded = expandedNames.has(habit.id)
            return (
              <div key={habit.id} className="flex items-center gap-2 text-sm">
                {!isCompleted ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Complete Habit</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark "{habit.name}" as completed for today?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCompleteHabit(habit.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Complete Habit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div className="h-6 w-6 flex items-center justify-center">
                    <Check className="h-4 w-4 text-purple-500" />
                  </div>
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
