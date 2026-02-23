import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HabitStatusAlertsProps {
  backendHealthy: boolean | null
  error: string | null
}

export function HabitStatusAlerts({ backendHealthy, error }: HabitStatusAlertsProps) {
  return (
    <>
      {backendHealthy === false && (
        <Alert className="border-yellow-500/20 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            Backend is unavailable. The app requires a connection to function.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
