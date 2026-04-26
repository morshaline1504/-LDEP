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
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"


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

interface ChartData {
  month: string
  monetary: number
  physical: number
  donors: number
}

interface CategoryData {
  name: string
  value: number
}

interface VolunteerPerformance {
  name: string
  tasks: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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

  const [donationTrends, setDonationTrends] = useState<ChartData[]>([])
  const [donationTypes, setDonationTypes] = useState<CategoryData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [volunteerPerformance, setVolunteerPerformance] = useState<VolunteerPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      if (!document.hidden) loadData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, chartData] = await Promise.all([
        store.getStats(),
        store.getChartStats()
      ])
      setStats(statsData)

      // Use real chart data from API
      if (chartData.trends && chartData.trends.length > 0) {
        setDonationTrends(chartData.trends)
      }
      
      if (chartData.donationTypes && chartData.donationTypes.length > 0) {
        setDonationTypes(chartData.donationTypes)
      }
      
      if (chartData.categories && chartData.categories.length > 0) {
        setCategoryData(chartData.categories)
      } else {
        // Fallback to default categories if no data
        setCategoryData([
          { name: "Food", value: 0 },
          { name: "Clothes", value: 0 },
          { name: "Books", value: 0 },
          { name: "Medicine", value: 0 },
          { name: "Electronics", value: 0 },
          { name: "Others", value: 0 }
        ])
      }
      
      if (chartData.volunteerPerformance && chartData.volunteerPerformance.length > 0) {
        setVolunteerPerformance(chartData.volunteerPerformance)
      }
    } catch (error) {
      console.error("Failed to load chart data:", error)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Stats Cards */}
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

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Donation Trends - Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Donation Trends (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donationTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="monetary"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Monetary (৳)"
                    dot={{ fill: "#0088FE" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="physical"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Physical Items"
                    dot={{ fill: "#00C49F" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Donation Type Breakdown - Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donationTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {donationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `৳${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. Category-wise Physical Donations - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category-wise Physical Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#0088FE" radius={[0, 4, 4, 0]} name="Items" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Volunteer Performance - Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Volunteer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volunteerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="#00C49F" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        

  
      </div>
    </div>
  )
}
