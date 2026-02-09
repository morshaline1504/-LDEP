"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Trophy,
  MessageSquare,
  DollarSign,
  UserCog,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { AdminOverview } from "./admin-overview"
import { VolunteerManagement } from "./volunteer-management"
import { PhysicalDonationReview } from "./physical-donation-review"
import { TaskManagement } from "./task-management"
import { Leaderboard } from "./leaderboard"
import { FeedbackReview } from "./feedback-review"
import { TransactionLedger } from "./transaction-ledger"
import { ProfileSettings } from "@/components/profile-settings"

const navItems = [
  { label: "Overview", value: "overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Volunteers", value: "volunteers", icon: <Users className="h-4 w-4" /> },
  { label: "Donations", value: "donations", icon: <Package className="h-4 w-4" /> },
  { label: "Tasks", value: "tasks", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Blockchain", value: "blockchain", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Leaderboard", value: "leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { label: "Feedback", value: "feedback", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Profile", value: "profile", icon: <UserCog className="h-4 w-4" /> },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardShell
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      roleLabel="Admin"
    >
      {activeTab === "overview" && <AdminOverview />}
      {activeTab === "volunteers" && <VolunteerManagement />}
      {activeTab === "donations" && <PhysicalDonationReview />}
      {activeTab === "tasks" && <TaskManagement />}
      {activeTab === "blockchain" && <TransactionLedger />}
      {activeTab === "leaderboard" && <Leaderboard />}
      {activeTab === "feedback" && <FeedbackReview />}
      {activeTab === "profile" && <ProfileSettings />}
    </DashboardShell>
  )
}
