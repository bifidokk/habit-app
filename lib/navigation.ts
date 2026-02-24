export enum AppView {
  Today = 'today',
  Year = 'year',
  Settings = 'settings',
  HabitDetail = 'habit-detail',
}

export type NavState =
  | { view: AppView.Today }
  | { view: AppView.Year }
  | { view: AppView.Settings }
  | { view: AppView.HabitDetail; habitId: string }
