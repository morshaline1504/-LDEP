"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  DollarSign,
  Package,
  MessageSquare,
  Trophy,
  UserCog,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DonorOverview } from "./donor-overview"
import { MonetaryDonation } from "./monetary-donation"
import { PhysicalDonationForm } from "./physical-donation-form"
import { DonorFeedback } from "./donor-feedback"
import { DonorLeaderboard } from "./donor-leaderboard"
import { ProfileSettings } from "@/components/profile-settings"

const navItems = [
  { label: "Overview", value: "overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Donate Money", value: "monetary", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Physical Items", value: "physical", icon: <Package className="h-4 w-4" /> },
  { label: "Feedback", value: "feedback", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Leaderboard", value: "leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { label: "Profile", value: "profile", icon: <UserCog className="h-4 w-4" /> },
]

export function DonorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardShell
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      roleLabel="Donor"
    >
      {activeTab === "overview" && <DonorOverview />}
      {activeTab === "monetary" && <MonetaryDonation />}
      {activeTab === "physical" && <PhysicalDonationForm />}
      {activeTab === "feedback" && <DonorFeedback />}
      {activeTab === "leaderboard" && <DonorLeaderboard />}
      {activeTab === "profile" && <ProfileSettings />}
    </DashboardShell>
  )
}
