import type { Habit, HabitInput } from "@/types/habit"
import { 
  fetchHabits, 
  createHabit as apiCreateHabit, 
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion
} from "@/lib/api"

// Main storage functions - now all backend-based
export async function getHabits(): Promise<Habit[]> {
  try {
    return await fetchHabits()
  } catch (error) {
    throw error
  }
}

// Create a new habit
export async function addHabit(input: HabitInput): Promise<Habit> {
  try {
    return await apiCreateHabit(input)
  } catch (error) {
    throw error
  }
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  try {
    const habitInput: HabitInput = {
      name: habit.name,
      days: habit.days,
      time: habit.time
    }
    return await apiUpdateHabit(habit.id, habitInput)
  } catch (error) {
    throw error
  }
}

// Delete a habit
export async function removeHabit(habitId: string): Promise<void> {
  try {
    await apiDeleteHabit(habitId)
  } catch (error) {
    throw error
  }
}

// Toggle habit completion
export async function toggleHabitCompletion(habitId: string, date: string): Promise<void> {
  try {
    const habit = await getHabitById(habitId)
    if (!habit) throw new Error('Habit not found')
    
    const completions = habit.completions || []
    const existingCompletion = completions.find((c) => c.date === date)
    const newCompletionStatus = existingCompletion ? !existingCompletion.completed : true
    
    await apiToggleHabitCompletion(habitId, date, newCompletionStatus)
  } catch (error) {
    throw error
  }
}

// Helper function to get a single habit by ID
export async function getHabitById(habitId: string): Promise<Habit | null> {
  try {
    const habits = await getHabits()
    return habits.find(h => h.id === habitId) || null
  } catch (error) {
    return null
  }
}

// Helper to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

// Helper to check if habit is completed today
export function isHabitCompletedToday(habit: Habit): boolean {
  const today = getTodayDateString()
  const completion = habit.completions?.find((c) => c.date === today)
  return completion?.completed || false
}

// Helper to check if habit should be active today
export function isHabitActiveToday(habit: Habit): boolean {
  const today = new Date().getDay() // 0=Sun, 1=Mon, etc.
  return habit.days.includes(today)
}





