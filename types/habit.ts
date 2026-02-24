export type Habit = {
  id: string
  name: string
  days: number[] // 0..6 (Mon..Sun)
  time: string // "HH:MM"
  color: string // hex color e.g. "#8b5cf6"
  createdAt: string
  completions?: HabitCompletion[] // New: track when habits were completed
}

export type HabitCompletion = {
  date: string // "YYYY-MM-DD"
  completed: boolean
}

export type HabitInput = {
  name: string
  days: number[]
  time: string
  color: string
}

export type HabitStats = {
  currentStreak: number
  longestStreak: number
  completionRate: number // 0-100
  totalCompletions: number
  weeklyData: { day: string; completed: number; total: number }[]
}
