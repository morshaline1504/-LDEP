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
import { Package } from "lucide-react"
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
]

const conditionOptions = ["New", "Like New", "Used", "Needs Repair"]
const timeSlotOptions = ["Morning", "Afternoon", "Evening"]
const foodTypeOptions = ["Cooked", "Packaged"]

export function PhysicalDonationForm() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<PhysicalDonation[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: "",
    quantity: "",
    condition: "",
    foodType: "",
    expiryDate: "",
    location: "",
    preferredDate: "",
    timeSlot: "",
    phone: "",
    email: "",
    description: "",
    specialInstructions: "",
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

  const isFood = form.type === "Food Supplies"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error("User not authenticated.")
      return
    }
    if (!form.type || !form.quantity || !form.location || !form.condition || !form.phone) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!/^\d{11}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 11 digits.")
      return
    }
    setLoading(true)
    try {
      await store.createPhysicalDonation(
        user.id,
        user.name,
        form.type,
        Number.parseInt(form.quantity),
        form.condition,
        isFood ? form.foodType : "",
        isFood && form.expiryDate ? form.expiryDate : null,
        form.location,
        form.preferredDate || null,
        form.timeSlot,
        form.phone,
        form.email,
        form.description,
        "",
        form.specialInstructions
      )
      toast.success("Physical donation submitted for review!")
      setForm({
        type: "",
        quantity: "",
        condition: "",
        foodType: "",
        expiryDate: "",
        location: "",
        preferredDate: "",
        timeSlot: "",
        phone: "",
        email: "",
        description: "",
        specialInstructions: "",
      })
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
              
              
            </CardTitle>
           
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ── Item Information ── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Item Information
              </p>

              <div className="flex flex-col gap-2">
                <Label>Item Type <span className="text-destructive">*</span></Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm({ ...form, type: v, foodType: "", expiryDate: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {donationTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-quantity">Quantity <span className="text-destructive">*</span></Label>
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
                <Label>Condition <span className="text-destructive">*</span></Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Food-only fields */}
              {isFood && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Food Type</Label>
                    <Select
                      value={form.foodType}
                      onValueChange={(v) => setForm({ ...form, foodType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select food type" />
                      </SelectTrigger>
                      <SelectContent>
                        {foodTypeOptions.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pd-expiry">Expiry Date</Label>
                    <Input
                      id="pd-expiry"
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* ── Pickup Details ── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2">
                Pickup Details
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-location">Pickup Location <span className="text-destructive">*</span></Label>
                <Input
                  id="pd-location"
                  placeholder="Full address for pickup"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-preferred-date">Preferred Pickup Date</Label>
                <Input
                  id="pd-preferred-date"
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                />
              </div>
              {/* ── Donor Info ── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2">
                Donor Info
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-phone">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="pd-phone"
                  type="tel"
                  placeholder="11-digit phone number"
                  maxLength={11}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-email">Email (optional)</Label>
                <Input
                  id="pd-email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* ── Additional ── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-2">
                Additional
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-desc">Description</Label>
                <Textarea
                  id="pd-desc"
                  placeholder="Describe the items in detail..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pd-instructions">Special Instructions (optional)</Label>
                <Textarea
                  id="pd-instructions"
                  placeholder="Any special handling or pickup instructions..."
                  rows={2}
                  value={form.specialInstructions}
                  onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
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
                {donations.map((d, index) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-muted-foreground font-mono">#{index + 1}</p>
                      <p className="font-medium text-card-foreground">{d.type}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {d.quantity} | {d.location}
                      </p>
                      {d.phone && (
                        <p className="text-xs text-muted-foreground">📞 {d.phone}</p>
                      )}
                      {d.description && (
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                      )}
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