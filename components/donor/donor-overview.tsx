"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, Star, TrendingUp } from "lucide-react"
import type { MonetaryDonation, PhysicalDonation } from "@/lib/types"

export function DonorOverview() {
  const { user } = useAuth()
  const [monetaryDonations, setMonetaryDonations] = useState<MonetaryDonation[]>([])
  const [physicalDonations, setPhysicalDonations] = useState<PhysicalDonation[]>([])
  const [myRank, setMyRank] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [md, pd, leaders] = await Promise.all([
        store.getDonorMonetaryDonations(user!.id),
        store.getDonorPhysicalDonations(user!.id),
        store.getLeaderboard(),
      ])
      setMonetaryDonations(md)
      setPhysicalDonations(pd)
      setMyRank(leaders.findIndex((l) => l.donorId === user!.id) + 1)
      setLoading(false)
    }
    load()
  }, [user])

  if (!user) return null

  const totalDonated = monetaryDonations.reduce((s, d) => s + d.amount, 0)

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your donation activity at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donated
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {"৳"}{totalDonated.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monetary Donations
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10">
              <TrendingUp className="h-4 w-4 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {monetaryDonations.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Physical Donations
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Package className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {physicalDonations.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leaderboard Rank
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Star className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {myRank > 0 ? `#${myRank}` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent monetary donations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {monetaryDonations.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">
              You have not made any donations yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {monetaryDonations
                .slice(0, 5)
                .map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-card-foreground">
                        {"৳"}{d.amount.toLocaleString()} via{" "}
                        {d.method === "bkash" ? "bKash" : "Nagad"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {d.txHash.substring(0, 24)}...
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <Badge className="bg-success text-success-foreground">
                        Confirmed
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
