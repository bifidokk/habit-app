import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HabitPageHeaderProps {
  displayName: string
  initials: string
  photoUrl?: string
  showAddForm: boolean
  onToggleAddForm: () => void
}

export function HabitPageHeader({ displayName, initials, photoUrl, showAddForm, onToggleAddForm }: HabitPageHeaderProps) {
  return (
    <header className="flex items-center gap-3 pb-4">
      <Avatar className="h-10 w-10 ring-1 ring-white/10">
        <AvatarImage
          src={photoUrl || "/placeholder.svg?height=40&width=40&query=telegram%20user%20avatar"}
          alt={photoUrl ? "User photo" : "Guest avatar"}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold leading-tight truncate bg-gradient-to-r from-purple-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
          Habits
        </h1>
        <p className="text-sm text-muted-foreground truncate">
          {displayName}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-white/20 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors"
        onClick={onToggleAddForm}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        {showAddForm ? "Hide form" : "Add habit"}
      </Button>
    </header>
  )
}
