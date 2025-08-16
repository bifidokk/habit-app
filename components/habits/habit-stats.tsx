"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { calculateHabitStats, generateMockCompletions } from "@/lib/stats"
import type { Habit } from "@/types/habit"
import { Flame, Target, TrendingUp, Calendar } from "lucide-react"

export function HabitStats({ habits }: { habits: Habit[] }) {
  const statsData = useMemo(() => {
    return habits.map((habit) => {
      // Add mock completions for demo if none exist
      const habitWithCompletions = {
        ...habit,
        completions: habit.completions?.length ? habit.completions : generateMockCompletions(habit),
      }

      return {
        habit: habitWithCompletions,
        stats: calculateHabitStats(habitWithCompletions),
      }
    })
  }, [habits])

  const overallStats = useMemo(() => {
    if (statsData.length === 0) return null

    const totalCompletions = statsData.reduce((sum, { stats }) => sum + stats.totalCompletions, 0)
    const avgCompletionRate = Math.round(
      statsData.reduce((sum, { stats }) => sum + stats.completionRate, 0) / statsData.length,
    )
    const longestStreak = Math.max(...statsData.map(({ stats }) => stats.longestStreak))
    const activeStreaks = statsData.filter(({ stats }) => stats.currentStreak > 0).length

    return { totalCompletions, avgCompletionRate, longestStreak, activeStreaks }
  }, [statsData])

  if (habits.length === 0) {
    return (
      <Card className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Add some habits to see your statistics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300">{overallStats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Total completions</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-fuchsia-400" />
              </div>
              <div className="text-2xl font-bold text-fuchsia-300">{overallStats.avgCompletionRate}%</div>
              <div className="text-xs text-muted-foreground">Avg completion</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-300">{overallStats.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest streak</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-300">{overallStats.activeStreaks}</div>
              <div className="text-xs text-muted-foreground">Active streaks</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Habit Stats */}
      <div className="grid gap-4">
        {statsData.map(({ habit, stats }) => (
          <Card
            key={habit.id}
            className="rounded-2xl border-white/15 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{habit.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    <Flame className="h-3 w-3 mr-1" />
                    {stats.currentStreak}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-purple-300/30 text-purple-300">
                    {stats.completionRate}%
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Current streak: {stats.currentStreak} days • Best: {stats.longestStreak} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--primary))",
                  },
                  total: {
                    label: "Total",
                    color: "hsl(var(--muted-foreground))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
