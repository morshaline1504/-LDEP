"use client"

import { useEffect, useState } from "react"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Star } from "lucide-react"
import type { Feedback } from "@/lib/types"

export function FeedbackReview() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  useEffect(() => {
    store.getFeedbacks().then(setFeedbacks)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Donor Feedback</h1>
        <p className="text-muted-foreground">
          Review feedback submitted by donors about volunteers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbacks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No feedback submitted yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.donorName}</TableCell>
                      <TableCell>{f.volunteerName}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="max-w-[300px]">{f.comment}</TableCell>
                      <TableCell>
                        {new Date(f.createdAt).toLocaleDateString()}
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
