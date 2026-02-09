"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Plus } from "lucide-react"
import type { DonationStatus, PhysicalDonation } from "@/lib/types"

const statusColor: Record<DonationStatus, string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
}

const donationTypes = [
  "Clothing",
  "Food Supplies",
  "Books",
  "Electronics",
  "Furniture",
  "Medical Supplies",
  "Toys",
  "Other",
]

export function PhysicalDonationForm() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<PhysicalDonation[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: "",
    quantity: "",
    location: "",
    description: "",
  })

  const loadDonations = useCallback(async () => {
    if (!user) return
    const data = await store.getDonorPhysicalDonations(user.id)
    setDonations(data)
  }, [user])

  useEffect(() => {
    loadDonations()
  }, [loadDonations])

  if (!user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error("User not authenticated.")
      return
    }
    if (!form.type || !form.quantity || !form.location) {
      toast.error("Please fill in all required fields.")
      return
    }
    setLoading(true)
    try {
      await store.createPhysicalDonation(
        user.id,
        user.name,
        form.type,
        Number.parseInt(form.quantity),
        form.location,
        form.description,
        ""
      )
      toast.success("Physical donation submitted for review!")
      setForm({ type: "", quantity: "", location: "", description: "" })
      loadDonations()
    } catch {
      toast.error("Failed to submit donation.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Physical Donations</h1>
        <p className="text-muted-foreground">
          Submit physical items for collection by volunteers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Submit Donation
            </CardTitle>
            <CardDescription>
              Fill in the details of items you want to donate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Item Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {donationTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-quantity">Quantity</Label>
                <Input
                  id="pd-quantity"
                  type="number"
                  min="1"
                  placeholder="Number of items"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-location">Pickup Location</Label>
                <Input
                  id="pd-location"
                  placeholder="Full address for pickup"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-desc">Description</Label>
                <Textarea
                  id="pd-desc"
                  placeholder="Describe the items..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Package className="mr-2 h-4 w-4" />
                {loading ? "Submitting..." : "Submit Donation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submissions</CardTitle>
            <CardDescription>Track the status of your physical donations</CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No physical donations submitted yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {donations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium text-card-foreground">{d.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {d.quantity} | {d.location}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.description}</p>
                    </div>
                    <Badge className={statusColor[d.status]}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
