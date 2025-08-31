# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
# Start development server
pnpm dev
# or
npm run dev

# Build for production
pnpm build
# or 
npm run build

# Run production build
pnpm start
# or
npm run start

# Lint code
pnpm lint
# or
npm run lint
```

### Package Management
This project uses both pnpm and npm - check for `pnpm-lock.yaml` to determine which is preferred.

## Architecture Overview

### Core Purpose
This is a **Telegram Mini App** for habit tracking that also works as a standalone web application. The app is fully integrated with a PHP backend through Telegram WebApp authentication, with no local storage for habits.

### Tech Stack
- **Framework**: Next.js 15.2.4 (App Router)
- **UI**: Tailwind CSS + shadcn/ui components (New York style)
- **TypeScript**: Full TypeScript implementation
- **Telegram Integration**: Custom Telegram WebApp wrapper with theme synchronization

### Key Directories
- `app/` - Next.js app router pages (main entry: `app/telegram-app/page.tsx`)
- `components/` - Reusable UI components
  - `components/ui/` - shadcn/ui base components
  - `components/habits/` - Habit-specific components
  - `components/fx/` - Visual effects (BackgroundFX)
- `lib/` - Core utilities and business logic
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks

### Data Architecture

#### Core Types (`types/habit.ts`)
- `Habit` - Main habit entity with days array (0=Monday, 6=Sunday), time, and completions
- `HabitCompletion` - Tracks completion status for specific dates
- `HabitStats` - Calculated statistics (streaks, completion rates)

#### Storage Layer (`lib/storage.ts`)
- **Current**: Backend-based storage via API calls
- **Architecture**: Direct integration with PHP backend through authenticated API endpoints
- Key functions: `getHabits()`, `addHabit()`, `updateHabit()`, `removeHabit()`, `completeHabit()`

#### Statistics (`lib/stats.ts`)
- Calculates streaks, completion rates, and weekly data
- Handles habit scheduling (which days habits should be active)
- Includes mock data generation for demos

### Telegram Integration

#### WebApp Connection (`lib/telegram.ts`)
- Detects Telegram WebApp environment
- Extracts user data and authentication info
- Prepared for backend authentication via `initData`

#### Theme System (`lib/telegram-theme.ts`)
- **Auto-syncing**: Reads Telegram's theme and applies to CSS variables
- **Fallback**: "Cozy" purple/black theme for non-Telegram usage
- **Responsive**: Updates when user changes Telegram theme
- Maps Telegram colors to shadcn/ui CSS variables

### UI Architecture

#### Design System
- **Base**: shadcn/ui components with Tailwind CSS
- **Theme**: Glass-morphic cards with backdrop blur
- **Colors**: Purple/fuchsia gradients with cozy dark theme
- **Animations**: Floating blob effects and subtle transitions

#### Key Components
- `HabitForm` - Add new habits with day selection and time picker
- `HabitList` - Display and manage existing habits
- `TodaySummary` - Progress overview with completion status
- `HabitStats` - Statistics visualization (when enabled)

### Configuration Files
- `components.json` - shadcn/ui configuration (New York style, Lucide icons)
- `next.config.mjs` - Next.js config with build optimizations disabled for development
- `tsconfig.json` - TypeScript configuration with path aliases (`@/` prefix)

### Development Notes

#### Path Aliases
- `@/` - Root directory
- `@/components` - Components directory
- `@/lib` - Library utilities
- `@/types` - Type definitions
- `@/hooks` - Custom hooks

#### State Management
- React state for UI interactions
- Backend API for data persistence
- No external state management library

#### Backend Integration
The app is fully integrated with a PHP backend:
- All habit operations go through authenticated API endpoints
- Uses Telegram `initData` for authentication
- Complete CRUD operations for habits via backend

#### Mobile-First Design
- Designed primarily for mobile Telegram usage
- Responsive design works on desktop browsers
- Touch-friendly interfaces and appropriate spacing

### Special Features

#### Telegram Theme Sync
The app automatically adapts to user's Telegram theme settings and updates in real-time when users change themes within Telegram.

#### Visual Effects
Custom animated background with floating gradients and subtle grain overlay for enhanced visual appeal.

#### Smart Scheduling
Habits are scheduled by days of the week with intelligent handling of "today" calculations and streak tracking.
