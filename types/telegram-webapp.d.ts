export {}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand?: () => void
        colorScheme?: "light" | "dark"
        themeParams?: Record<string, string>
        initData?: string
        initDataUnsafe?: {
          query_id?: string
          user?: {
            id: number
            is_bot?: boolean
            first_name?: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          [k: string]: unknown
        }
      }
    }
  }
}
