import type { Habit, HabitInput } from "@/types/habit"
import { getAuthState } from "@/lib/auth"
import { 
  fetchHabits, 
  createHabit as apiCreateHabit, 
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
  syncHabits,
  ApiError 
} from "@/lib/api"

const STORAGE_KEY = "habit_app_habits_v1"
const MIGRATION_KEY = "habit_app_migrated"

// Local storage functions (fallback)
export function getLocalHabits(): Habit[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Habit[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

// Check if data has been migrated to backend
function isMigrated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(MIGRATION_KEY) === "true"
}

function markAsMigrated() {
  if (typeof window === "undefined") return
  localStorage.setItem(MIGRATION_KEY, "true")
}

// Main storage functions that choose between local and backend
export async function getHabits(): Promise<Habit[]> {
  const { isAuthenticated } = getAuthState()
  
  if (!isAuthenticated) {
    return getLocalHabits()
  }
  
  try {
    // If authenticated, try to get from backend
    const backendHabits = await fetchHabits()
    
    // If this is the first time getting backend data and we have local data,
    // migrate local data to backend
    if (!isMigrated()) {
      const localHabits = getLocalHabits()
      if (localHabits.length > 0) {
        try {
          const syncedHabits = await syncHabits(localHabits)
          markAsMigrated()
          // Clear local storage after successful migration
          localStorage.removeItem(STORAGE_KEY)
          return syncedHabits
        } catch (error) {
          markAsMigrated() // Mark as migrated to avoid repeated attempts
        }
      } else {
        markAsMigrated()
      }
    }
    
    return backendHabits
  } catch (error) {
    return getLocalHabits()
  }
}

export function saveLocalHabits(habits: Habit[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  const { isAuthenticated } = getAuthState()
  
  if (!isAuthenticated) {
    saveLocalHabits(habits)
    return
  }
  
  // If authenticated, we don't need to save all habits at once
  // Individual CRUD operations will handle backend updates
  // This function is mainly for local fallback
}

// Create a new habit
export async function addHabit(input: HabitInput): Promise<Habit> {
  const { isAuthenticated } = getAuthState()
  
  if (!isAuthenticated) {
    // Local mode - create habit locally
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `hb_${Date.now().toString(36)}_${Math.round(Math.random() * 1e6)}`
    
    const newHabit: Habit = {
      id,
      name: input.name.trim(),
      days: [...input.days].sort((a, b) => a - b),
      time: input.time,
      createdAt: new Date().toISOString(),
    }
    
    const habits = getLocalHabits()
    const updatedHabits = [newHabit, ...habits]
    saveLocalHabits(updatedHabits)
    return newHabit
  }
  
  // Backend mode
  try {
    return await apiCreateHabit(input)
  } catch (error) {
    throw error
  }
}

// Delete a habit
export async function removeHabit(habitId: string): Promise<void> {
  const { isAuthenticated } = getAuthState()
  
  if (!isAuthenticated) {
    // Local mode
    const habits = getLocalHabits()
    const updatedHabits = habits.filter(h => h.id !== habitId)
    saveLocalHabits(updatedHabits)
    return
  }
  
  // Backend mode
  try {
    await apiDeleteHabit(habitId)
  } catch (error) {
    throw error
  }
}

// Toggle habit completion
export async function toggleHabitCompletion(habitId: string, date: string): Promise<Habit[]> {
  const { isAuthenticated } = getAuthState()
  
  if (!isAuthenticated) {
    // Local mode
    if (typeof window === "undefined") return []
    
    const habits = getLocalHabits()
    const habitIndex = habits.findIndex((h) => h.id === habitId)
    
    if (habitIndex === -1) return habits
    
    const habit = habits[habitIndex]
    const completions = habit.completions || []
    const existingIndex = completions.findIndex((c) => c.date === date)
    
    if (existingIndex >= 0) {
      // Toggle existing completion
      completions[existingIndex].completed = !completions[existingIndex].completed
    } else {
      // Add new completion
      completions.push({ date, completed: true })
    }
    
    habit.completions = completions
    habits[habitIndex] = habit
    
    saveLocalHabits(habits)
    return habits
  }
  
  // Backend mode
  try {
    const habit = await getHabitById(habitId)
    if (!habit) throw new Error('Habit not found')
    
    const completions = habit.completions || []
    const existingCompletion = completions.find((c) => c.date === date)
    const newCompletionStatus = existingCompletion ? !existingCompletion.completed : true
    
    await apiToggleHabitCompletion(habitId, date, newCompletionStatus)
    
    // Return updated habits list
    return await getHabits()
  } catch (error) {
    throw error
  }
}

// Helper function to get a single habit by ID
export async function getHabitById(habitId: string): Promise<Habit | null> {
  const habits = await getHabits()
  return habits.find(h => h.id === habitId) || null
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

// Legacy function - now handled by the main storage functions
export async function syncWithBackendIfNeeded(_habit?: Habit | HabitInput) {
  // This function is deprecated - authentication and backend sync
  // are now handled automatically by the main storage functions
}
