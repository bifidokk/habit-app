import { useCallback, useEffect, useState } from "react"
import { getHabits, addHabit, removeHabit, updateHabit } from "@/lib/storage"
import { useAuth } from "@/contexts/auth-context"
import type { Habit, HabitInput } from "@/types/habit"

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const refreshHabits = useCallback(async () => {
    const updated = await getHabits()
    setHabits(updated)
  }, [])

  // Helper: run an action, refresh, handle errors
  const withRefresh = useCallback(
    async (action: () => Promise<unknown>, errorMsg: string) => {
      try {
        setError(null)
        await action()
        await refreshHabits()
      } catch (err) {
        setError(err instanceof Error ? err.message : errorMsg)
      }
    },
    [refreshHabits],
  )

  useEffect(() => {
    const loadHabits = async () => {
      if (authLoading) return

      setIsLoading(true)
      setError(null)

      try {
        const loadedHabits = await getHabits()
        setHabits(loadedHabits)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load habits")
      } finally {
        setIsLoading(false)
      }
    }

    loadHabits()
  }, [isAuthenticated, authLoading])

  const onAdd = useCallback(
    (input: HabitInput) => withRefresh(() => addHabit(input), "Failed to add habit"),
    [withRefresh],
  )

  const onDelete = useCallback(
    (id: string) => withRefresh(() => removeHabit(id), "Failed to delete habit"),
    [withRefresh],
  )

  const onUpdate = useCallback(
    (habit: Habit) => withRefresh(() => updateHabit(habit), "Failed to update habit"),
    [withRefresh],
  )

  const onHabitCompleted = useCallback(
    () => withRefresh(() => Promise.resolve(), "Failed to refresh habits"),
    [withRefresh],
  )

  return { habits, isLoading, error, onAdd, onDelete, onUpdate, onHabitCompleted }
}
