import { AuthProvider } from '@/contexts/auth-context'
import { LocaleProvider } from '@/contexts/locale-context'
import TelegramHabitAppContent from '@/components/telegram-habit-app'

export default function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <TelegramHabitAppContent />
      </LocaleProvider>
    </AuthProvider>
  )
}
