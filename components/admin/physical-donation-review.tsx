"use client"

import { useState, useEffect, useCallback } from "react"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle, XCircle } from "lucide-react"
import type { DonationStatus, PhysicalDonation } from "@/lib/types"

const statusColor: Record<DonationStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
}

export function PhysicalDonationReview() {
  const [donations, setDonations] = useState<PhysicalDonation[]>([])

  const loadData = useCallback(async () => {
    const data = await store.getPhysicalDonations()
    setDonations(data)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleApprove(id: string) {
    await store.approvePhysicalDonation(id)
    toast.success("Donation approved successfully.")
    loadData()
  }

  async function handleReject(id: string) {
    await store.rejectPhysicalDonation(id)
    toast.error("Donation has been rejected.")
    loadData()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Physical Donations</h1>
        <p className="text-muted-foreground">
          Review and approve physical donation submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Physical Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No physical donations submitted yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.donorName}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.quantity}</TableCell>
                      <TableCell>{d.location}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {d.description}
                      </TableCell>
                      <TableCell>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[d.status]}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {d.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(d.id)}>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(d.id)}>
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
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
