import type { Habit, HabitInput } from "@/types/habit"
import {
  fetchHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion
} from "@/lib/api"
import { jsDayToBackendDay } from "@/lib/utils"
import { DEFAULT_HABIT_COLOR } from "@/lib/habit-colors"

function normalizeHabit(habit: Habit): Habit {
  return { ...habit, color: habit.color || DEFAULT_HABIT_COLOR }
}

export async function getHabits(): Promise<Habit[]> {
  const habits = await fetchHabits()
  return habits.map(normalizeHabit)
}

export async function addHabit(input: HabitInput): Promise<Habit> {
  return normalizeHabit(await apiCreateHabit(input))
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const habitInput: HabitInput = {
    name: habit.name,
    days: habit.days,
    time: habit.time,
    color: habit.color,
  }
  return normalizeHabit(await apiUpdateHabit(habit.id, habitInput))
}

export async function removeHabit(habitId: string): Promise<void> {
  await apiDeleteHabit(habitId)
}

export async function completeHabit(habitId: string, date: string): Promise<Habit> {
  return normalizeHabit(await apiToggleHabitCompletion(habitId, date, true))
}

export async function toggleHabit(habitId: string, date: string, completed: boolean): Promise<Habit> {
  return normalizeHabit(await apiToggleHabitCompletion(habitId, date, completed))
}

export async function getHabitById(habitId: string): Promise<Habit | null> {
  try {
    const habits = await getHabits()
    return habits.find(h => h.id === habitId) || null
  } catch {
    return null
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

export function isHabitCompletedToday(habit: Habit): boolean {
  const today = getTodayDateString()
  const completion = habit.completions?.find((c) => c.date === today)
  return completion?.completed || false
}

export function isHabitActiveToday(habit: Habit): boolean {
  const jsToday = new Date().getDay() // 0=Sun, 1=Mon, etc.
  const backendToday = jsDayToBackendDay(jsToday) // Convert to backend day system
  return habit.days.includes(backendToday)
}
