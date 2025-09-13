"use client"

import { Trash2, Check, Flame, Target, TrendingUp, ChevronDown, ChevronRight, Edit, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, jsDayToBackendDay } from "@/lib/utils"
import type { Habit } from "@/types/habit"
import { useMemo, useState } from "react"
import { completeHabit, getTodayDateString, isHabitCompletedToday, isHabitActiveToday } from "@/lib/storage"
import { calculateHabitStats } from "@/lib/stats"
import { HabitHeatmap } from "./habit-heatmap"
import { HabitEditForm } from "./habit-edit-form"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const UI_ORDER = [0, 1, 2, 3, 4, 5, 6] // Mon..Sun

export function HabitList({
  habits = [],
  onDelete = () => {},
  onUpdate = () => {},
  onHabitCompleted = () => {},
}: {
  habits?: Habit[]
  onDelete?: (id: string) => void
  onUpdate?: (habit: Habit) => void
  onHabitCompleted?: () => void
}) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [expandedNames, setExpandedNames] = useState<Set<string>>(new Set())

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
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
      onHabitCompleted()
    } catch (error) {
      console.error('Failed to complete habit:', error)
    }
  }

  const handleSaveHabit = (updatedHabit: Habit) => {
    onUpdate(updatedHabit)
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
        const stats = calculateHabitStats(habit)

        return (
          <div
            key={habit.id}
            className={cn(
              "rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-sm shadow-purple-900/10 transition-all",
              isCompletedToday && "bg-purple-500/10 border-purple-400/20",
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpandedHabit(isExpanded ? null : habit.id)
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`Toggle details for habit: ${habit.name}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {isActiveToday && !isCompletedToday && (
                  <div className="flex items-center pt-0.5">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
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
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "font-medium transition-colors flex items-center gap-2",
                      isCompletedToday && "text-purple-400",
                    )}
                  >
                    {isMobile && isLongName(habit.name) ? (
                      // Mobile: Expandable text
                      <div className="flex items-center gap-1">
                        <span 
                          className={cn(
                            "block transition-all duration-200 ease-in-out",
                            expandedNames.has(habit.id) 
                              ? "whitespace-normal text-foreground" 
                              : "truncate max-w-[150px] text-foreground/90"
                          )}
                        >
                          {habit.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 w-6 p-0 rounded-full transition-all duration-200",
                            expandedNames.has(habit.id)
                              ? "text-foreground bg-white/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleNameExpansion(habit.id)
                          }}
                        >
                          {expandedNames.has(habit.id) ? (
                            <ChevronUp className="h-3 w-3 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Desktop: Tooltip
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate block max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] flex-shrink-0 cursor-help" title={habit.name}>
                              {habit.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="break-words">{habit.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {isCompletedToday && <Check className="h-4 w-4 text-purple-400" />}
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
                      // Convert JavaScript day (0=Sunday) to backend day (0=Monday) for comparison
                      const jsToday = new Date().getDay()
                      const backendToday = jsDayToBackendDay(jsToday)
                      const isToday = d === backendToday
                      return (
                        <Badge
                          key={d}
                          variant="outline"
                          className={cn(
                            "text-[11px] rounded-full",
                            active ? "bg-purple-500/90 text-white border-purple-500/90" : "border-purple-300/30 text-purple-300/80",
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
                          <Flame className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-lg font-bold text-purple-300">{stats.currentStreak}</div>
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
                          <TrendingUp className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-lg font-bold text-purple-300">{stats.completionRate}%</div>
                        <div className="text-xs text-muted-foreground">Rate</div>
                      </div>
                    </div>

                    {/* 3-month heatmap */}
                    <div className="overflow-x-auto">
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Last 3 Months</h4>
                      <div className="min-w-0">
                        <HabitHeatmap habit={habit} />
                      </div>
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
