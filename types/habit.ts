export type Habit = {
  id: string
  name: string
  days: number[] // 0..6 (Sun..Sat)
  time: string // "HH:MM"
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
}

export type HabitStats = {
  currentStreak: number
  longestStreak: number
  completionRate: number // 0-100
  totalCompletions: number
  weeklyData: { day: string; completed: number; total: number }[]
}
