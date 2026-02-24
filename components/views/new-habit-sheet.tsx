"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/habits/color-picker"
import { DEFAULT_HABIT_COLOR } from "@/lib/habit-colors"
import { HABIT_TEMPLATES } from "@/lib/habit-templates"
import type { HabitInput } from "@/types/habit"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface NewHabitSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (input: HabitInput) => void
}

export function NewHabitSheet({ open, onOpenChange, onAdd }: NewHabitSheetProps) {
  const [name, setName] = useState("")
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [time, setTime] = useState("09:00")
  const [color, setColor] = useState(DEFAULT_HABIT_COLOR)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && days.length > 0 && /^\d{2}:\d{2}$/.test(time)
  }, [name, days, time])

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const applyTemplate = (template: typeof HABIT_TEMPLATES[number]) => {
    setName(template.name)
    setDays(template.days)
    setTime(template.time)
    setColor(template.color)
  }

  const reset = () => {
    setName("")
    setDays([0, 1, 2, 3, 4])
    setTime("09:00")
    setColor(DEFAULT_HABIT_COLOR)
  }

  const handleSave = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      onAdd({ name: name.trim(), days: [...days], time, color })
      reset()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={handleCancel} className="text-sm text-muted-foreground">
          Cancel
        </button>
        <h2 className="text-base font-semibold">New Habit</h2>
        <button
          onClick={handleSave}
          disabled={!canSubmit || submitting}
          className={cn(
            "text-sm font-semibold",
            canSubmit && !submitting ? "text-purple-400" : "text-muted-foreground/40"
          )}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="new-habit-name">Name</Label>
          <Input
            id="new-habit-name"
            placeholder="e.g., Read 30 minutes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            autoComplete="off"
          />
        </div>

        {/* Templates */}
        <div className="space-y-2">
          <Label>Templates</Label>
          <div className="grid grid-cols-2 gap-2">
            {HABIT_TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => applyTemplate(t)}
                className={cn(
                  "text-left text-sm px-3 py-2 rounded-xl border transition-colors",
                  name === t.name
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <Label>Color</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Days */}
        <div className="space-y-2">
          <Label>Days</Label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm transition-colors",
                  days.includes(i)
                    ? "text-white border-transparent"
                    : "bg-background hover:bg-muted border-muted-foreground/20"
                )}
                style={
                  days.includes(i)
                    ? { backgroundColor: color, borderColor: color }
                    : undefined
                }
                aria-pressed={days.includes(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="new-habit-time">Reminder time</Label>
          <Input
            id="new-habit-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step={60}
          />
        </div>
      </div>
    </div>
  )
}
