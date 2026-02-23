import { AuthProvider } from '@/contexts/auth-context'
import TelegramHabitAppContent from '@/components/telegram-habit-app'

export default function App() {
  return (
    <AuthProvider>
      <TelegramHabitAppContent />
    </AuthProvider>
  )
}
