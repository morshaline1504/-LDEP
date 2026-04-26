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
import { Plus, MapPin, Clock, Zap } from "lucide-react"
import type { TaskStatus, Task as TaskType, PhysicalDonation, User } from "@/lib/types"


let tasksCache: TaskType[] = []
let lastFetch = 0
const CACHE_TTL = 60000
const statusColor: Record<TaskStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  "in-progress": "bg-chart-3/20 text-foreground",
  completed: "bg-success text-success-foreground",
}

interface NearestVolunteer {
  id: string
  name: string
  email: string
  phone: string
  qualifications: string
  serviceArea: string
  latitude: number | null
  longitude: number | null
  distance: number
  distanceFormatted: string
  estimatedTime: string
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [approvedDonations, setApprovedDonations] = useState<PhysicalDonation[]>([])
  const [approvedVolunteers, setApprovedVolunteers] = useState<User[]>([])
  const [nearestVolunteers, setNearestVolunteers] = useState<NearestVolunteer[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState("")
  const [selectedVolunteer, setSelectedVolunteer] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loadingNearest, setLoadingNearest] = useState(false)
  const [autoAssign, setAutoAssign] = useState(true)
  const [loading, setLoading] = useState(false)

const loadData = useCallback(async (forceRefresh = false) => {
  const now = Date.now()
  if (!forceRefresh && tasksCache.length > 0 && now - lastFetch < CACHE_TTL) {
    setTasks(tasksCache)
    setLoading(false)
    return
  }
  setLoading(true)
  try {
    const [t, pd, vols] = await Promise.all([
      store.getTasks(),
      store.getPhysicalDonations(),
      store.getApprovedVolunteers(),
    ])
    tasksCache = t
    lastFetch = Date.now()
    setTasks(t)
    const assignedDonationIds = new Set(t.map((task) => task.donationId))
    setApprovedDonations(pd.filter((d) => d.status === "approved" && !assignedDonationIds.has(d.id)))
    setApprovedVolunteers(vols)
  } finally {
    setLoading(false)
  }
}, [])
// Auto-refresh every 30 seconds without showing loading
useEffect(() => {
  const interval = setInterval(() => loadData(false), 30000)
  return () => clearInterval(interval)
}, [loadData])

  useEffect(() => {
    loadData(true)
  }, [loadData])

  // Load nearest volunteers when a donation is selected
  useEffect(() => {
    async function loadNearestVolunteers() {
      if (!selectedDonation || !autoAssign) {
        setNearestVolunteers([])
        return
      }

      const donation = approvedDonations.find(d => d.id === selectedDonation)
      if (!donation) {
        setNearestVolunteers([])
        return
      }

      // Try to get coordinates from donation or use default Dhaka coordinates
      // In a real app, we'd geocode the address. For now, we'll use default
      
      const { getAreaCoordinates } = await import("@/lib/areaCoordinates")
      const donorCoords = getAreaCoordinates(donation.location)
      const lat = donorCoords?.latitude ?? 23.8103
      const lng = donorCoords?.longitude ?? 90.4125

      setLoadingNearest(true)
      try {
        const volunteers = await store.getNearestVolunteers(lat, lng, 50, 100)

        setNearestVolunteers(volunteers)
        
        // Auto-select nearest volunteer if available
        if (volunteers.length > 0 && !selectedVolunteer) {
          setSelectedVolunteer(volunteers[0].id)
        }
      } catch (error) {
        console.error("Failed to load nearest volunteers:", error)
        setNearestVolunteers([])
      } finally {
        setLoadingNearest(false)
      }
    }

    loadNearestVolunteers()
  }, [selectedDonation, autoAssign, approvedDonations])

  async function handleCreate() {
    if (!selectedDonation || !selectedVolunteer || !deadline) {
      toast.error("Please fill all fields.")
      return
    }

    const distance = selectedVolunteerData?.distanceFormatted
const estimatedTime = selectedVolunteerData?.estimatedTime
const task = await store.createTask(selectedDonation, selectedVolunteer, deadline, distance, estimatedTime)

    if (task) {
      toast.success("Task assigned successfully.")
      setDialogOpen(false)
      setSelectedDonation("")
      setSelectedVolunteer("")
      setDeadline("")
      loadData(true)
    }
  }

  const selectedDonationData = approvedDonations.find(d => d.id === selectedDonation)
  const selectedVolunteerData = nearestVolunteers.find(v => v.id === selectedVolunteer)

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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Pickup Task</DialogTitle>
              <DialogDescription>
                Select a donation and volunteer for the pickup. Enable Smart Assignment to automatically find the nearest volunteer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {/* Smart Assignment Toggle */}
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Zap className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Smart Volunteer Assignment</p>
                  <p className="text-sm text-muted-foreground">Automatically find the nearest volunteer</p>
                </div>
                <Button 
                  variant={autoAssign ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setAutoAssign(!autoAssign)}
                >
                  {autoAssign ? "ON" : "OFF"}
                </Button>
              </div>

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

              {autoAssign && selectedDonation && (
                <div className="flex flex-col gap-2">
                  <Label>Smart Suggested Volunteers</Label>
                  {loadingNearest ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Finding nearest volunteers...</span>
                    </div>
                  ) : nearestVolunteers.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {nearestVolunteers.map((v, index) => (
                        <div
                          key={v.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                            selectedVolunteer === v.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedVolunteer(v.id)}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{v.name}</p>
                            <p className="text-xs text-muted-foreground">{v.qualifications}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-primary">
                              <MapPin className="h-3 w-3" />
                              {v.distanceFormatted}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {v.estimatedTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                      No nearby volunteers found with location data. Please disable Smart Assignment to select manually.
                    </div>
                  )}
                </div>
              )}

              {!autoAssign && (
                <div className="flex flex-col gap-2">
                  <Label>Volunteer (Manual)</Label>
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
              )}

              {/* Selected Assignment Summary */}
              {selectedDonationData && selectedVolunteerData && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-sm font-medium text-foreground">Assignment Summary</p>


                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pickup:</p>
                      <p className="font-medium">{selectedDonationData.type}</p>
                    </div>
                    <div>
                       <p className="text-muted-foreground">From (Donor):</p>
                      <p className="font-medium">{selectedDonationData.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volunteer:</p>
                      <p className="font-medium">{selectedVolunteerData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance:</p>
                      <p className="font-medium text-primary">{selectedVolunteerData.distanceFormatted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone (Donor):</p>
                      <p className="font-medium">{selectedDonationData.phone || "—"}</p>
                    </div>

                  <div>
                      <p className="text-muted-foreground">Estimated Time:</p>
                      <p className="font-medium">{selectedVolunteerData.estimatedTime}</p>
                    </div>
                  </div>

                  

                </div>
              )}
                  


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
          

          {loading ? (
  <p className="py-8 text-center text-muted-foreground">Loading tasks...</p>
) : tasks.length === 0 ? (
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
  {t.pickupPhotoUrl || t.deliveryPhotoUrl || t.proofPhotoUrl ? (
    <button
      className="text-sm text-primary underline hover:opacity-80"
      onClick={() => {
        const url = t.pickupPhotoUrl || t.deliveryPhotoUrl || t.proofPhotoUrl;
        if (!url) return;
        if (url.startsWith("data:")) {
          const [header, data] = url.split(",");
          const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
          const byteChars = atob(data);
          const byteArr = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteArr[i] = byteChars.charCodeAt(i);
          }
          const blob = new Blob([byteArr], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        } else {
          window.open(url, "_blank");
        }
      }}
    >
      View Photo
    </button>
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
