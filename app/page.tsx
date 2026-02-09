"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { LandingPage } from "@/components/landing-page"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { DonorDashboard } from "@/components/donor/donor-dashboard"
import { VolunteerDashboard } from "@/components/volunteer/volunteer-dashboard"

export default function Page() {
  const { user, isLoading } = useAuth()
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    // Check if database has data, if not seed it
    async function checkAndSeed() {
      try {
        const stats = await store.getStats()
        if (stats.totalDonors === 0 && stats.totalVolunteers === 0) {
          // Database is empty, seed it
          const success = await store.seedDatabase()
          if (!success) {
            setDbError(true)
          }
        }
        setDbReady(true)
      } catch {
        // If stats call fails, try to seed anyway
        try {
          await store.seedDatabase()
          setDbReady(true)
        } catch {
          setDbError(true)
          setDbReady(true)
        }
      }
    }
    checkAndSeed()
  }, [])

  if (isLoading || !dbReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            {!dbReady ? "Connecting to database..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (dbError && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-destructive">Database Connection Error</p>
          <p className="text-sm text-muted-foreground">
            Could not connect to MongoDB. Please ensure the MONGODB_URI environment variable is set correctly.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />
    case "donor":
      return <DonorDashboard />
    case "volunteer":
      return <VolunteerDashboard />
    default:
      return <LandingPage />
  }
}
