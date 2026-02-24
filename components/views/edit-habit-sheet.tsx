"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/habits/color-picker"
import type { Habit } from "@/types/habit"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface EditHabitSheetProps {
  habit: Habit | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (habit: Habit) => void
  onDelete: (id: string) => void
}

export function EditHabitSheet({ habit, open, onOpenChange, onSave, onDelete }: EditHabitSheetProps) {
  const [name, setName] = useState("")
  const [days, setDays] = useState<number[]>([])
  const [time, setTime] = useState("09:00")
  const [color, setColor] = useState("#8b5cf6")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (habit && open) {
      setName(habit.name)
      setDays(habit.days)
      setTime(habit.time)
      setColor(habit.color)
    }
  }, [habit, open])

  const canSave = useMemo(() => {
    return name.trim().length > 0 && days.length > 0 && /^\d{2}:\d{2}$/.test(time)
  }, [name, days, time])

  const toggleDay = (d: number) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const handleSave = async () => {
    if (!canSave || !habit) return
    setSaving(true)
    try {
      onSave({
        ...habit,
        name: name.trim(),
        days: [...days].sort((a, b) => a - b),
        time,
        color,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!habit) return
    onDelete(habit.id)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground">
          Cancel
        </button>
        <h2 className="text-base font-semibold">Edit Habit</h2>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={cn(
            "text-sm font-semibold",
            canSave && !saving ? "text-purple-400" : "text-muted-foreground/40"
          )}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="edit-habit-name">Name</Label>
          <Input
            id="edit-habit-name"
            placeholder="e.g., Read 30 minutes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            autoComplete="off"
          />
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
          <Label htmlFor="edit-habit-time">Reminder time</Label>
          <Input
            id="edit-habit-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            step={60}
          />
        </div>

        {/* Delete */}
        <div className="pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full rounded-xl">
                Delete Habit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{habit?.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
