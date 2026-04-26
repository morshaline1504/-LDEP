"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle, Clock, MapPin } from "lucide-react"
import type { Task, TaskStatus } from "@/lib/types"

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  "in-progress": "bg-chart-3/20 text-foreground",
  completed: "bg-success text-success-foreground",
}

export function VolunteerOverview() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!user) return
  setLoading(true)
  store.getVolunteerTasks(user.id).then((t) => {
    setTasks(t)
    setLoading(false)
  }).catch(() => setLoading(false))
}, [user])
  if (!user) return null

  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length
  const completedCount = tasks.filter((t) => t.status === "completed").length

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your volunteer dashboard and task summary</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Tasks
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10">
              <ClipboardList className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No tasks assigned yet. Please wait for admin to assign tasks.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {tasks
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-card-foreground">
                        {t.donationType} Pickup
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Donor: {t.donorName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t.location}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(t.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusColor[t.status]}>
                      {t.status === "in-progress"
                        ? "In Progress"
                        : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
