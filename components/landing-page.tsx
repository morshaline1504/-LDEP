"use client"

import { useState, useEffect, useRef } from "react"
import {
  Heart,
  Shield,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  UserPlus,
  HandHeart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthModal, type AuthMode } from "@/components/auth-modal"
import { store } from "@/lib/store"
import { toast } from "sonner"

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2500,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(ease * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])
  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>("select-role")
  const [stats, setStats] = useState({
    totalMonetary: 0,
    totalDonors: 0,
    totalVolunteers: 0,
    totalTasks: 0,
  })
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
  const [contactLoading, setContactLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await store.getStats()
        setStats({
          totalMonetary: data.totalMonetary || 0,
          totalDonors: data.totalDonors || 0,
          totalVolunteers: data.totalVolunteers || 0,
          totalTasks: data.totalTasks || 0,
        })
      } catch {
        setStats({ totalMonetary: 0, totalDonors: 0, totalVolunteers: 0, totalTasks: 0 })
      }
    }
    fetchStats()
    const id = setInterval(fetchStats, 30000)
    return () => clearInterval(id)
  }, [])

  function openAuth(mode: AuthMode) {
    setAuthMode(mode)
    setAuthOpen(true)
    setMobileMenuOpen(false)
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  async function handleContact(e: React.FormEvent) {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields")
      return
    }
    setContactLoading(true)
    try {
      const result = await store.sendContactMessage(
        contactForm.name,
        contactForm.email,
        contactForm.message
      )
      if (result.success) {
        toast.success("Message sent successfully! We'll respond within 24 hours.")
        setContactForm({ name: "", email: "", message: "" })
      } else {
        toast.error(result.error || "Failed to send message")
      }
    } catch {
      toast.error("Failed to send message")
    } finally {
      setContactLoading(false)
    }
  }

  const testimonials = [
    {
      name: "Rahim Ahmed",
      role: "Donor",
      quote: "As a donor, I finally feel confident where my money goes. The blockchain transparency is incredible.",
      rating: 5,
      initial: "R",
    },
    {
      name: "Nusrat Jahan",
      role: "Volunteer",
      quote: "The platform helped me find real opportunities to contribute. The task system is very organized.",
      rating: 5,
      initial: "N",
    },
    {
      name: "Karim Hossain",
      role: "Donor",
      quote: "I can see exactly where every taka goes. This level of transparency is what charity platforms should offer.",
      rating: 5,
      initial: "K",
    },
  ]

  const navLinks = [
  { label: "About", id: "about" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Contact", id: "contact" },
]

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">HopeBridge</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Transparent Giving Platform</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => openAuth("select-role")}
              >
                Sign In
              </Button>
              <button
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 border-t border-border mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-sm font-medium text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors text-left px-3 py-2.5 rounded-md"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main id="main-content">

        {/* HERO */}
        <section className="py-24 lg:py-32 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 px-4 py-1.5">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Blockchain Verified Donations
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-5">
                  One Donation Can
                  <span className="text-green-600 block">Transform a Life</span>
                  Forever
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-7">
                  A transparent, blockchain-powered platform ensuring every contribution reaches those who need it most.
                  Track every Taka from your wallet to real impact.
                </p>

                {/* Hero: Volunteer Registration button only */}
                <div className="flex flex-col sm:flex-row gap-4 mb-7">
  
</div>

                <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                  {["100% transparent", "Real-time tracking", "Verified volunteers"].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Donation Card Mockup */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm md:max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                  <div className="bg-green-600 px-6 py-4">
                    <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Example Campaign</p>
                    <h3 className="text-white font-bold text-xl mt-1">Food Drive Campaign</h3>
                    <Badge className="mt-2 bg-white/20 text-white border-0 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified Campaign
                    </Badge>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span className="font-semibold text-green-600">70%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: "70%" }}
                          role="progressbar"
                          aria-valuenow={70}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Campaign progress 70%"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground">Raised</p>
                        <p className="font-bold text-foreground text-lg">৳70,000</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-muted-foreground">Goal</p>
                        <p className="font-bold text-foreground text-lg">৳1,00,000</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Raised by <span className="font-semibold text-foreground">124 donors</span>
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                      onClick={() => openAuth("register-donor")}
                    >
                      Donate Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-foreground">Our Impact So Far</h2>
              <p className="text-muted-foreground mt-2 text-lg">Real numbers from real people making a difference</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { value: stats.totalMonetary, label: "Total Donated", icon: Heart, prefix: "৳" },
                { value: stats.totalDonors, label: "Total Donors", icon: Users, prefix: "" },
                { value: stats.totalVolunteers, label: "Active Volunteers", icon: Shield, prefix: "" },
                { value: stats.totalTasks, label: "Tasks Completed", icon: TrendingUp, prefix: "" },
              ].map((stat) => (
                <Card key={stat.label} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-100 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-3xl font-black text-foreground">
                      <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-foreground">How It Works</h2>
              <p className="text-muted-foreground mt-3 text-lg">Get started in just 3 simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Register", desc: "Sign up as a donor in seconds. Create your profile and get verified.", icon: Users },
                { step: "02", title: "Donate", desc: "Choose monetary or physical donations. Every transaction is blockchain-secured.", icon: Heart },
                { step: "03", title: "Track Impact", desc: "Monitor how your donation makes a difference in real-time with live tracking.", icon: TrendingUp },
              ].map((item, i) => (
                <Card key={i} className="border border-border shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                  <CardContent className="relative p-8 flex flex-col items-center text-center">
                    <span className="absolute top-4 right-5 text-7xl font-black text-gray-100 select-none pointer-events-none z-0" aria-hidden="true">
                      {item.step}
                    </span>
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="relative z-10 text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="relative z-10 text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="about" className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-foreground">Why Choose HopeBridge?</h2>
              <p className="text-muted-foreground mt-3 text-lg">Built for trust, transparency, and real impact</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Blockchain Transparency", desc: "Every transaction is securely recorded, ensuring full visibility and zero misuse of funds." },
                { icon: MapPin, title: "Smart Volunteer Matching", desc: "Our system connects verified volunteers to tasks based on location and skill for fast delivery." },
                { icon: TrendingUp, title: "Real-time Tracking", desc: "Instantly track donations, task progress, and real-world impact with live updates." },
              ].map((feature, i) => (
                <Card key={i} className="border border-border shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-green-100 group-hover:bg-green-600 flex items-center justify-center mb-6 transition-colors duration-300">
                      <feature.icon className="w-7 h-7 text-green-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-foreground">Trusted by Our Community</h2>
              <p className="text-muted-foreground mt-3 text-lg">Real stories from real people</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <Card key={i} className="border border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex mb-4" aria-label={`${t.rating} out of 5 stars`}>
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className="text-foreground text-base leading-relaxed mb-6 italic">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">{t.initial}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20 px-4 sm:px-6 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-foreground">Have Questions?</h2>
              <p className="text-muted-foreground mt-3 text-lg">
                We&apos;d love to hear from you. Our team typically responds within 24 hours.
              </p>
            </div>
            <Card className="border border-border shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={handleContact} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-medium text-foreground">Your Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Rahim Ahmed"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="border-border focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email Address</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="rahim@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="border-border focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm font-medium text-foreground">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="How can we help you?"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="border-border focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
                  >
                    {contactLoading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

       


      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-10 text-white mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HopeBridge</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building trust in digital donations through transparency and blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => { e.preventDefault(); scrollTo(link.id) }}
                      className="hover:text-green-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-300">Contact Info</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-500 shrink-0" /> +880 1405091911</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-green-500 shrink-0" />  bsse1504@iit.du.ac.bd</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500 shrink-0" /> Dhaka, Bangladesh</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} HopeBridge. All rights reserved. | Transparent Giving Platform
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} mode={authMode} onModeChange={setAuthMode} />
    </div>
  )
}