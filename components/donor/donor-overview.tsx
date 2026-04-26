"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Package, Star, TrendingUp, Heart, Users, CheckCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { MonetaryDonation, PhysicalDonation } from "@/lib/types"

interface MonthlyData {
  month: string
  amount: number
}

export function DonorOverview() {
  const { user } = useAuth()
  const [monetaryDonations, setMonetaryDonations] = useState<MonetaryDonation[]>([])
  const [physicalDonations, setPhysicalDonations] = useState<PhysicalDonation[]>([])
  const [myRank, setMyRank] = useState(0)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
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

      const months = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          date,
          month: date.toLocaleDateString("en-US", { month: "short" }),
        })
      }

      const data = months.map((m) => {
        const monthDonations = md.filter((d) => {
          const dDate = new Date(d.timestamp)
          return dDate.getMonth() === m.date.getMonth() && dDate.getFullYear() === m.date.getFullYear()
        })
        return {
          month: m.month,
          amount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
        }
      })
      setMonthlyData(data)
      setLoading(false)
    }
    load()
  }, [user])

  if (!user) return null

  const totalDonated = monetaryDonations.reduce((s, d) => s + d.amount, 0)
  const totalItems = physicalDonations.reduce((s, d) => s + d.quantity, 0)
  const estimatedBeneficiaries = Math.floor(totalDonated / 500)
  const nextMilestone = 10000
  const progressToNext = Math.min((totalDonated / nextMilestone) * 100, 100)

  const milestones = [
    { name: "Bronze", threshold: 1000, icon: "🥉" },
    { name: "Silver", threshold: 5000, icon: "🥈" },
    { name: "Gold", threshold: 10000, icon: "🥇" },
    { name: "Platinum", threshold: 25000, icon: "💎" },
    { name: "Diamond", threshold: 50000, icon: "💠" },
  ]

  const currentMilestone = milestones.find((m) => totalDonated < m.threshold) || milestones[milestones.length - 1]
  const milestoneIndex = milestones.findIndex((m) => m.name === currentMilestone.name)
  const nextMilestoneName = currentMilestone.name

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
        <p className="text-muted-foreground">Your donation activity at a glance</p>
      </div>

      {/* Impact Meter */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/30 bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">{estimatedBeneficiaries}</span>
                <span className="text-sm text-muted-foreground">people helped</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="mt-1 text-xs text-muted-foreground">
                {nextMilestone - totalDonated > 0
                  ? `৳${(nextMilestone - totalDonated).toLocaleString()} more to reach ${nextMilestoneName}`
                  : `You've reached ${nextMilestoneName} level!`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              ৳{totalDonated.toLocaleString()}
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
              Physical Items
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Package className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {totalItems}
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

      {/* My Donation History - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, "Amount"]}
                />
                <Bar
                  dataKey="amount"
                  fill="#0088FE"
                  radius={[4, 4, 0, 0]}
                  name="Donation"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent donations */}
     
    </div>
  )
}