export interface HabitTemplate {
  name: string
  days: number[]
  time: string
  color: string
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { name: '📖 Read', days: [0, 1, 2, 3, 4, 5, 6], time: '21:00', color: '#3b82f6' },
  { name: '🏃 Run', days: [0, 2, 4], time: '07:00', color: '#22c55e' },
  { name: '🧘 Meditate', days: [0, 1, 2, 3, 4, 5, 6], time: '06:30', color: '#a855f7' },
  { name: '💪 Workout', days: [0, 2, 4], time: '08:00', color: '#ef4444' },
  { name: '💧 Drink Water', days: [0, 1, 2, 3, 4, 5, 6], time: '09:00', color: '#06b6d4' },
  { name: '📝 Journal', days: [0, 1, 2, 3, 4, 5, 6], time: '22:00', color: '#eab308' },
  { name: '🎸 Practice Music', days: [0, 1, 2, 3, 4], time: '18:00', color: '#f97316' },
  { name: '🧹 Clean', days: [5, 6], time: '10:00', color: '#14b8a6' },
  { name: '📱 No Screens', days: [0, 1, 2, 3, 4, 5, 6], time: '21:30', color: '#64748b' },
  { name: '🌿 Walk Outside', days: [0, 1, 2, 3, 4, 5, 6], time: '12:00', color: '#84cc16' },
]
