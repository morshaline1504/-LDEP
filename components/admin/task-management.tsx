"use client"

import { useState, useEffect, useCallback } from "react"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"
import type { TaskStatus, Task as TaskType, PhysicalDonation, User } from "@/lib/types"

const statusColor: Record<TaskStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  "in-progress": "bg-chart-3/20 text-foreground",
  completed: "bg-success text-success-foreground",
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [approvedDonations, setApprovedDonations] = useState<PhysicalDonation[]>([])
  const [approvedVolunteers, setApprovedVolunteers] = useState<User[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState("")
  const [selectedVolunteer, setSelectedVolunteer] = useState("")
  const [deadline, setDeadline] = useState("")

  const loadData = useCallback(async () => {
    const [t, pd, vols] = await Promise.all([
      store.getTasks(),
      store.getPhysicalDonations(),
      store.getApprovedVolunteers(),
    ])
    setTasks(t)
    setApprovedDonations(pd.filter((d) => d.status === "approved"))
    setApprovedVolunteers(vols)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreate() {
    if (!selectedDonation || !selectedVolunteer || !deadline) {
      toast.error("Please fill all fields.")
      return
    }
    const task = await store.createTask(selectedDonation, selectedVolunteer, deadline)
    if (task) {
      toast.success("Task assigned successfully.")
      setDialogOpen(false)
      setSelectedDonation("")
      setSelectedVolunteer("")
      setDeadline("")
      loadData()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">
            Assign and monitor volunteer pickup tasks
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Pickup Task</DialogTitle>
              <DialogDescription>
                Select a donation and volunteer for the pickup
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Donation</Label>
                <Select value={selectedDonation} onValueChange={setSelectedDonation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a donation" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedDonations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.type} - {d.donorName} ({d.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Volunteer</Label>
                <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a volunteer" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedVolunteers.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} - {v.qualifications}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate}>Assign Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No tasks created yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.volunteerName}</TableCell>
                      <TableCell>{t.donorName}</TableCell>
                      <TableCell>{t.donationType}</TableCell>
                      <TableCell>{t.location}</TableCell>
                      <TableCell>{new Date(t.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[t.status]}>
                          {t.status === "in-progress"
                            ? "In Progress"
                            : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.proofPhotoUrl ? (
                          <span className="text-sm text-primary">Uploaded</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
