"use client"

import { Trash2, Check, Flame, Target, TrendingUp, ChevronDown, ChevronRight, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"
import type { Habit } from "@/types/habit"
import { useMemo, useState } from "react"
import { toggleHabitCompletion, getTodayDateString, isHabitCompletedToday, isHabitActiveToday } from "@/lib/storage"
import { calculateHabitStats, generateMockCompletions } from "@/lib/stats"
import { HabitHeatmap } from "./habit-heatmap"
import { HabitEditForm } from "./habit-edit-form"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const UI_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon..Sun

export function HabitList({
  habits = [],
  onDelete = () => {},
  onUpdate = () => {},
}: {
  habits?: Habit[]
  onDelete?: (id: string) => void
  onUpdate?: (habits: Habit[]) => void
}) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<string | null>(null)

  const handleToggleCompletion = async (habitId: string) => {
    try {
      const today = getTodayDateString()
      const updatedHabits = await toggleHabitCompletion(habitId, today)
      onUpdate(updatedHabits)
    } catch (error) {
      // TODO: Show error toast to user
    }
  }

  const handleSaveHabit = (updatedHabit: Habit) => {
    const updatedHabits = habits.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
    onUpdate(updatedHabits)
    setEditingHabit(null)
  }

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => a.name.localeCompare(b.name))
  }, [habits])

  if (sortedHabits.length === 0) return null

  return (
    <div className="grid gap-3">
      {sortedHabits.map((habit) => {
        const isActiveToday = isHabitActiveToday(habit)
        const isCompletedToday = isHabitCompletedToday(habit)
        const isExpanded = expandedHabit === habit.id

        // Calculate stats for this habit
        const habitWithCompletions = {
          ...habit,
          completions: habit.completions?.length ? habit.completions : generateMockCompletions(habit),
        }
        const stats = calculateHabitStats(habitWithCompletions)

        return (
          <div
            key={habit.id}
            className={cn(
              "rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-sm shadow-purple-900/10 transition-all",
              isCompletedToday && "bg-green-500/10 border-green-400/20",
              isExpanded && "bg-white/10",
            )}
          >
            {/* Main habit row - clickable */}
            <div
              className={cn(
                "flex items-start justify-between gap-3 p-3 cursor-pointer hover:translate-y-[-1px] hover:bg-white/5 transition-all",
                isExpanded && "border-b border-white/10",
              )}
              onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {isActiveToday && (
                  <div className="flex items-center pt-0.5">
                    <Checkbox
                      checked={isCompletedToday}
                      onCheckedChange={(e) => {
                        e.stopPropagation()
                        handleToggleCompletion(habit.id)
                      }}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "font-medium truncate transition-colors flex items-center gap-2",
                      isCompletedToday && "text-green-400",
                    )}
                  >
                    {habit.name}
                    {isCompletedToday && <Check className="h-4 w-4 text-green-400" />}
                    <div className="flex items-center gap-1 ml-auto">
                      <Badge variant="secondary" className="text-[10px] rounded-full">
                        <Flame className="h-3 w-3 mr-1" />
                        {stats.currentStreak}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-white/10 rounded-full w-8 h-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingHabit(habit.id)
                          if (!isExpanded) setExpandedHabit(habit.id)
                        }}
                        aria-label={`Edit ${habit.name}`}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {UI_ORDER.map((d) => {
                      const active = habit.days.includes(d)
                      const isToday = d === new Date().getDay()
                      return (
                        <Badge
                          key={d}
                          variant={active ? "default" : "outline"}
                          className={cn(
                            "text-[11px] rounded-full",
                            active ? "bg-primary/90 text-primary-foreground" : "border-primary/30 text-primary/80",
                            isToday && active && "ring-2 ring-purple-400/50",
                          )}
                        >
                          {DAYS[d]}
                        </Badge>
                      )
                    })}
                    <Badge variant="secondary" className="ml-1 text-[11px] rounded-full">
                      {habit.time}
                    </Badge>
                    {!isActiveToday && (
                      <Badge
                        variant="outline"
                        className="ml-1 text-[11px] rounded-full border-muted-foreground/30 text-muted-foreground"
                      >
                        Not today
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-white/10 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDelete(habit.id)
                    }}
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-white/15 bg-popover/80 backdrop-blur supports-[backdrop-filter]:bg-popover/60">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {"'"}
                      {habit.name}
                      {"'"} and its reminders.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl" onClick={() => setPendingDelete(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-xl"
                      onClick={() => {
                        if (pendingDelete) {
                          onDelete(pendingDelete)
                          setPendingDelete(null)
                        } else {
                          onDelete(habit.id)
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Expanded statistics section */}
            {isExpanded && (
              <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Edit mode or stats view */}
                {editingHabit === habit.id ? (
                  <HabitEditForm habit={habit} onSave={handleSaveHabit} onCancel={() => setEditingHabit(null)} />
                ) : (
                  <>
                    {/* Stats overview */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Flame className="h-4 w-4 text-orange-400" />
                        </div>
                        <div className="text-lg font-bold text-orange-300">{stats.currentStreak}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-lg font-bold text-purple-300">{stats.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Best</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-fuchsia-400" />
                        </div>
                        <div className="text-lg font-bold text-fuchsia-300">{stats.completionRate}%</div>
                        <div className="text-xs text-muted-foreground">Rate</div>
                      </div>
                    </div>

                    {/* 3-month heatmap */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Last 3 Months</h4>
                      <HabitHeatmap habit={habitWithCompletions} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
