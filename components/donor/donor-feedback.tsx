"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare } from "lucide-react"
import type { Task, Feedback } from "@/lib/types"

export function DonorFeedback() {
  const { user } = useAuth()
  const [tasksNeedingFeedback, setTasksNeedingFeedback] = useState<Task[]>([])
  const [existingFeedbacks, setExistingFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    const [allTasks, myDonations, feedbacks] = await Promise.all([
      store.getTasks(),
      store.getDonorPhysicalDonations(user.id),
      store.getDonorFeedbacks(user.id),
    ])
    const myDonationIds = new Set(myDonations.map((d) => d.id))
    const completedTasks = allTasks.filter(
      (t) => myDonationIds.has(t.donationId) && t.status === "completed"
    )
    const feedbackTaskIds = new Set(feedbacks.map((f) => f.taskId))
    setTasksNeedingFeedback(completedTasks.filter((t) => !feedbackTaskIds.has(t.id)))
    setExistingFeedbacks(feedbacks)
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!user) return null

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground">
          Rate and review volunteers who completed your donation pickups
        </p>
      </div>

      {tasksNeedingFeedback.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Pending Feedback</h2>
          {tasksNeedingFeedback.map((task) => (
            <FeedbackForm
              key={task.id}
              taskId={task.id}
              volunteerId={task.volunteerId}
              volunteerName={task.volunteerName}
              donationType={task.donationType}
              donorId={user.id}
              donorName={user.name}
              onSubmit={loadData}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Your Feedback History
          </CardTitle>
          <CardDescription>Previous feedback you have submitted</CardDescription>
        </CardHeader>
        <CardContent>
          {existingFeedbacks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No feedback submitted yet. Complete a donation pickup to leave feedback.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {existingFeedbacks.map((f) => (
                <div key={f.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-card-foreground">
                      Volunteer: {f.volunteerName}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < f.rating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FeedbackForm({
  taskId,
  volunteerId,
  volunteerName,
  donationType,
  donorId,
  donorName,
  onSubmit,
}: {
  taskId: string
  volunteerId: string
  volunteerName: string
  donationType: string
  donorId: string
  donorName: string
  onSubmit: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating.")
      return
    }
    setSubmitting(true)
    try {
      await store.createFeedback(donorId, donorName, volunteerId, volunteerName, taskId, rating, comment)
      toast.success("Thank you for your feedback!")
      onSubmit()
    } catch {
      toast.error("Failed to submit feedback.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Rate {volunteerName} for {donationType} pickup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i < (hoverRating || rating)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`comment-${taskId}`}>Comment</Label>
            <Textarea
              id={`comment-${taskId}`}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
