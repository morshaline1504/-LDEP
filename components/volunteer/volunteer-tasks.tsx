"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Calendar,
  User,
  Package,
  Play,
  CheckCircle,
  Upload,
  Clock,
} from "lucide-react"
import type { Task, TaskStatus } from "@/lib/types"

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  "in-progress": "bg-chart-3/20 text-foreground",
  completed: "bg-success text-success-foreground",
}

export function VolunteerTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [proofUrl, setProofUrl] = useState("")

  const loadTasks = useCallback(async () => {
    if (!user) return
    const data = await store.getVolunteerTasks(user.id)
    setTasks(data)
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (!user) return null

  const pending = tasks.filter((t) => t.status === "pending")
  const inProgress = tasks.filter((t) => t.status === "in-progress")
  const completed = tasks.filter((t) => t.status === "completed")

  async function handleStartTask(taskId: string) {
    await store.updateTaskStatus(taskId, "in-progress")
    toast.success("Task marked as in progress.")
    loadTasks()
  }

  function openCompleteDialog(task: Task) {
    setSelectedTask(task)
    setProofUrl("")
    setCompleteDialogOpen(true)
  }

  async function handleComplete() {
    if (!selectedTask) return
    await store.updateTaskStatus(selectedTask.id, "completed", proofUrl || "proof-uploaded")
    toast.success("Task completed successfully!")
    setCompleteDialogOpen(false)
    setSelectedTask(null)
    loadTasks()
  }

  function TaskCard({ task }: { task: Task }) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-card-foreground">
                  {task.donationType} Pickup
                </h3>
                <Badge className={`w-fit ${statusColor[task.status]}`}>
                  {task.status === "in-progress"
                    ? "In Progress"
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>Donor: {task.donorName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{task.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4 shrink-0" />
                <span>Type: {task.donationType}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {task.status === "pending" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleStartTask(task.id)}
                >
                  <Play className="mr-1 h-4 w-4" />
                  Start Task
                </Button>
              )}
              {task.status === "in-progress" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openCompleteDialog(task)}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              {task.status === "completed" && task.proofPhotoUrl && (
                <div className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  Proof uploaded
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground">
          View and manage your assigned pickup tasks
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-1">
            <Play className="h-3.5 w-3.5" />
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No tasks assigned yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No pending tasks.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {inProgress.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No tasks in progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No completed tasks yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Complete Task Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Complete Task
            </DialogTitle>
            <DialogDescription>
              Upload proof of collection to mark this task as complete
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <p className="font-medium text-foreground">
                  {selectedTask.donationType} from {selectedTask.donorName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.location}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="proof-url">Proof Photo URL (optional)</Label>
                <Input
                  id="proof-url"
                  placeholder="https://example.com/photo.jpg"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your proof photo, or leave blank to confirm without a photo
                </p>
              </div>
              <Button onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Completion
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
