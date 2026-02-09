"use client"

import { useEffect, useState } from "react"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  DollarSign,
  Package,
  ClipboardList,
  Clock,
  CheckCircle,
  UserCheck,
  AlertCircle,
} from "lucide-react"

interface Stats {
  totalDonors: number
  totalVolunteers: number
  pendingVolunteers: number
  totalMonetary: number
  totalPhysicalDonations: number
  pendingPhysicalDonations: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalDonors: 0,
    totalVolunteers: 0,
    pendingVolunteers: 0,
    totalMonetary: 0,
    totalPhysicalDonations: 0,
    pendingPhysicalDonations: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })

  useEffect(() => {
    store.getStats().then(setStats)
    const interval = setInterval(() => {
      store.getStats().then(setStats)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const cards = [
    {
      title: "Total Donors",
      value: stats.totalDonors,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Volunteers",
      value: stats.totalVolunteers,
      icon: UserCheck,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      title: "Pending Volunteers",
      value: stats.pendingVolunteers,
      icon: Clock,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Total Monetary",
      value: `৳${stats.totalMonetary.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Physical Donations",
      value: stats.totalPhysicalDonations,
      icon: Package,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingPhysicalDonations,
      icon: AlertCircle,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: ClipboardList,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and key metrics
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
