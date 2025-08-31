import type { Habit, HabitStats, HabitCompletion } from "@/types/habit"
import { jsDayToBackendDay, backendDayToJsDay } from "@/lib/utils"

// Get day of week (0=Sun, 1=Mon, etc.) for a date string - JavaScript system
function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay()
}

// Check if a habit should be active on a given date
function isHabitActiveOnDate(habit: Habit, dateStr: string): boolean {
  const jsDayOfWeek = getDayOfWeek(dateStr)
  const backendDayOfWeek = jsDayToBackendDay(jsDayOfWeek)
  return habit.days.includes(backendDayOfWeek)
}

// Get date string for N days ago
function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split("T")[0]
}

// Calculate current streak (consecutive days completed)
function calculateCurrentStreak(habit: Habit): number {
  const completions = habit.completions || []
  const completionMap = new Map(completions.map((c) => [c.date, c.completed]))

  let streak = 0
  const currentDate = new Date()

  // Go backwards from today
  for (let i = 0; i < 365; i++) {
    // Max 1 year lookback
    const dateStr = currentDate.toISOString().split("T")[0]

    if (isHabitActiveOnDate(habit, dateStr)) {
      const completed = completionMap.get(dateStr) || false
      if (completed) {
        streak++
      } else {
        break // Streak broken
      }
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

// Calculate longest streak ever
function calculateLongestStreak(habit: Habit): number {
  const completions = habit.completions || []
  const completionMap = new Map(completions.map((c) => [c.date, c.completed]))

  let longestStreak = 0
  let currentStreak = 0

  // Check last 365 days
  for (let i = 364; i >= 0; i--) {
    const dateStr = getDaysAgo(i)

    if (isHabitActiveOnDate(habit, dateStr)) {
      const completed = completionMap.get(dateStr) || false
      if (completed) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
  }

  return longestStreak
}

// Calculate completion rate over last 30 days
function calculateCompletionRate(habit: Habit): number {
  const completions = habit.completions || []
  const completionMap = new Map(completions.map((c) => [c.date, c.completed]))

  let totalDays = 0
  let completedDays = 0

  // Check last 30 days
  for (let i = 0; i < 30; i++) {
    const dateStr = getDaysAgo(i)

    if (isHabitActiveOnDate(habit, dateStr)) {
      totalDays++
      if (completionMap.get(dateStr)) {
        completedDays++
      }
    }
  }

  return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
}

// Get weekly completion data for charts
function getWeeklyData(habit: Habit) {
  const completions = habit.completions || []
  const completionMap = new Map(completions.map((c) => [c.date, c.completed]))

  // Backend system: 0=Monday, 1=Tuesday, ..., 6=Sunday
  // JavaScript system: 0=Sunday, 1=Monday, ..., 6=Saturday
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklyData = days.map((day, backendIndex) => {
    let completed = 0
    let total = 0

      // Check last 4 weeks for this day of week
      for (let week = 0; week < 4; week++) {
        // Convert backend index to JavaScript day for date calculation
        const jsDay = backendDayToJsDay(backendIndex)
        const daysBack = week * 7 + (6 - jsDay) // Calculate days back for this day of week
        const dateStr = getDaysAgo(daysBack)

        if (isHabitActiveOnDate(habit, dateStr) && habit.days.includes(backendIndex)) {
          total++
          if (completionMap.get(dateStr)) {
            completed++
          }
        }
      }

    return { day, completed, total }
  })

  return weeklyData
}

export function calculateHabitStats(habit: Habit): HabitStats {
  const completions = habit.completions || []
  const totalCompletions = completions.filter((c) => c.completed).length

  return {
    currentStreak: calculateCurrentStreak(habit),
    longestStreak: calculateLongestStreak(habit),
    completionRate: calculateCompletionRate(habit),
    totalCompletions,
    weeklyData: getWeeklyData(habit),
  }
}

// Generate mock completion data for demo purposes
export function generateMockCompletions(habit: Habit): HabitCompletion[] {
  const completions: HabitCompletion[] = []

  // Generate last 60 days of mock data
  for (let i = 0; i < 60; i++) {
    const dateStr = getDaysAgo(i)

    if (isHabitActiveOnDate(habit, dateStr)) {
      // 70% chance of completion for demo
      const completed = Math.random() > 0.3
      completions.push({ date: dateStr, completed })
    }
  }

  return completions
}
