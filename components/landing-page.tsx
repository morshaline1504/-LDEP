"use client"

import { useState } from "react"
import {
  Heart,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register-donor" | "register-volunteer" | "forgot-password" | "reset-password">("login")

  function openLogin() {
    setAuthMode("login")
    setAuthOpen(true)
  }

  function openRegister(type: "register-donor" | "register-volunteer") {
    setAuthMode(type)
    setAuthOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Link2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DonateChain</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={openLogin}>
              Sign In
            </Button>
            <Button onClick={() => openRegister("register-donor")}>
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Blockchain-verified transparent donations
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Transform Giving with
              <span className="text-primary"> Transparent</span> Donations
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              A secure, local donation exchange platform that connects donors
              with communities. Every transaction is recorded on the blockchain
              for complete transparency and accountability.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => openRegister("register-donor")}
              >
                Start Donating
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
                onClick={() => openRegister("register-volunteer")}
              >
                Become a Volunteer
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Admin login: admin@donationexchange.org / admin123
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Our platform streamlines the donation process from start to finish
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: "Make a Donation",
                desc: "Donate money via bKash/Nagad or submit physical items for collection.",
              },
              {
                icon: Shield,
                title: "Blockchain Verified",
                desc: "Every monetary transaction is recorded immutably on the blockchain.",
              },
              {
                icon: Users,
                title: "Volunteer Pickup",
                desc: "Verified volunteers are assigned tasks to collect physical donations.",
              },
              {
                icon: TrendingUp,
                title: "Track Impact",
                desc: "View leaderboards, give feedback, and see your donation impact.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground">
              Three Roles, One Mission
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Join as a donor, volunteer, or admin to make a difference
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Donor
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">
                Give with Confidence
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Make monetary donations via bKash or Nagad
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Submit physical items for collection
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Track your donations on the blockchain
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Rate and review volunteers
                </li>
              </ul>
              <Button
                className="mt-6 w-full"
                onClick={() => openRegister("register-donor")}
              >
                Register as Donor
              </Button>
            </div>

            <div className="rounded-xl border-2 border-primary bg-card p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                Volunteer
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">
                Make an Impact
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Register with your qualifications
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Get verified by admin
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Receive and complete pickup tasks
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Upload proof of completed tasks
                </li>
              </ul>
              <Button
                className="mt-6 w-full"
                onClick={() => openRegister("register-volunteer")}
              >
                Register as Volunteer
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent-foreground">
                Admin
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">
                Manage Everything
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Approve or reject volunteer applications
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Review physical donation submissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Assign and monitor pickup tasks
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  View leaderboard and donor feedback
                </li>
              </ul>
              <Button variant="outline" className="mt-6 w-full bg-transparent" onClick={openLogin}>
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">DonateChain</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure and transparent donation platform
          </p>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} mode={authMode} onModeChange={setAuthMode} />
    </div>
  )
}
