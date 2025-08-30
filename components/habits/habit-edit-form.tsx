"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types/habit"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const UI_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon..Sun

export function HabitEditForm({
  habit,
  onSave = () => {},
  onCancel = () => {},
}: {
  habit: Habit
  onSave?: (updatedHabit: Habit) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(habit.name)
  const [days, setDays] = useState<number[]>(habit.days)
  const [time, setTime] = useState(habit.time)
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(() => {
    return name.trim().length > 0 && days.length > 0 && /^\d{2}:\d{2}$/.test(time)
  }, [name, days, time])

  const hasChanges = useMemo(() => {
    return (
      name.trim() !== habit.name ||
      JSON.stringify([...days].sort()) !== JSON.stringify([...habit.days].sort()) ||
      time !== habit.time
    )
  }, [name, days, time, habit])

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const handleSave = async () => {
    if (!canSave || !hasChanges) return
    setSaving(true)
    try {
      const updatedHabit: Habit = {
        ...habit,
        name: name.trim(),
        days: [...days].sort((a, b) => a - b),
        time,
      }
      onSave(updatedHabit)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(habit.name)
    setDays(habit.days)
    setTime(habit.time)
    onCancel()
  }

  return (
    <div className="space-y-4 p-4 border-t border-white/10">
      <div className="grid gap-2">
        <Label htmlFor="edit-habit-name" className="text-sm font-medium">
          Habit name
        </Label>
        <Input
          id="edit-habit-name"
          placeholder="e.g., Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
          autoComplete="off"
          className="rounded-xl"
        />
        <div className="text-xs text-muted-foreground">
          {name.length}/255 characters
        </div>
      </div>

      <div className="grid gap-2">
        <Label className="text-sm font-medium">Reminder days</Label>
        <div className="flex flex-wrap gap-1.5">
          {UI_ORDER.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={cn(
                "px-3 py-1.5 rounded-md border text-sm transition-colors",
                days.includes(d)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-muted-foreground/20",
              )}
              aria-pressed={days.includes(d)}
              aria-label={`Toggle ${DAYS[d]}`}
            >
              {DAYS[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 max-w-xs">
        <Label htmlFor="edit-habit-time" className="text-sm font-medium">
          Reminder time
        </Label>
        <Input
          id="edit-habit-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          step={60}
          className="rounded-xl"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={!canSave || !hasChanges || saving} className="rounded-xl" size="sm">
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={handleCancel} className="rounded-xl bg-transparent" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  )
}
