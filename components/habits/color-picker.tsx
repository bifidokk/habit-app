"use client"

import { cn } from "@/lib/utils"
import { HABIT_COLORS } from "@/lib/habit-colors"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {HABIT_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "w-10 h-10 rounded-full transition-all duration-150",
            value === color
              ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
              : "hover:scale-105"
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
          aria-pressed={value === color}
        />
      ))}
    </div>
  )
}
