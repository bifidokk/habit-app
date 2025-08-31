"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { HabitInput } from "@/types/habit"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const UI_ORDER = [0, 1, 2, 3, 4, 5, 6] // Mon..Sun

export function HabitForm({
  onAdd = () => {},
  onSuccess = () => {},
}: {
  onAdd?: (input: HabitInput) => void
  onSuccess?: () => void
}) {
  const [name, setName] = useState("")
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]) // default weekdays
  const [time, setTime] = useState("09:00")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && days.length > 0 && /^\d{2}:\d{2}$/.test(time)
  }, [name, days, time])

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      onAdd({
        name: name.trim(),
        days: [...days],
        time,
      })
      setName("")
      setDays([0, 1, 2, 3, 4])
      setTime("09:00")
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="habit-name">Habit name</Label>
        <Input
          id="habit-name"
          placeholder="e.g., Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
          autoComplete="off"
        />
        <div className="text-xs text-muted-foreground">
          {name.length}/255 characters
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Reminder days</Label>
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
                  : "bg-background hover:bg-muted border-muted-foreground/20"
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
        <Label htmlFor="habit-time">Reminder time</Label>
        <Input
          id="habit-time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          step={60}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Adding..." : "Add habit"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName("")
            setDays([0, 1, 2, 3, 4])
            setTime("09:00")
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
