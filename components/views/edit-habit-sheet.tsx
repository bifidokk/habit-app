"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/habits/color-picker"
import { useLocale } from "@/contexts/locale-context"
import { getDayNames } from "@/lib/i18n"
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

interface EditHabitSheetProps {
  habit: Habit | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (habit: Habit) => void
  onDelete: (id: string) => void
}

export function EditHabitSheet({ habit, open, onOpenChange, onSave, onDelete }: EditHabitSheetProps) {
  const { t } = useLocale()
  const [name, setName] = useState("")
  const [days, setDays] = useState<number[]>([])
  const [time, setTime] = useState("09:00")
  const [color, setColor] = useState("#8b5cf6")
  const [saving, setSaving] = useState(false)

  const dayNames = getDayNames(t)

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
          {t('common.cancel')}
        </button>
        <h2 className="text-base font-semibold">{t('habits.edit')}</h2>
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={cn(
            "text-sm font-semibold",
            canSave && !saving ? "text-purple-400" : "text-muted-foreground/40"
          )}
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="edit-habit-name">{t('habits.name')}</Label>
          <Input
            id="edit-habit-name"
            placeholder={t('habits.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            autoComplete="off"
          />
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <Label>{t('habits.color')}</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Days */}
        <div className="space-y-2">
          <Label>{t('habits.days')}</Label>
          <div className="flex flex-wrap gap-1.5">
            {dayNames.map((label, i) => (
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
          <Label htmlFor="edit-habit-time">{t('habits.time')}</Label>
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
                {t('habits.deleteTitle')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('habits.deleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('habits.deleteConfirm').replace('{name}', habit?.name || '')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
