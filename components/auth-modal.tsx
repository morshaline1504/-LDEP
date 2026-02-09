"use client"

import React from "react"

import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LogIn, UserPlus } from "lucide-react"
import { ForgotPasswordForm, ResetPasswordForm } from "@/components/auth-forms"

type AuthMode = "login" | "register-donor" | "register-volunteer" | "forgot-password" | "reset-password"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthModal({ open, onOpenChange, mode, onModeChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "login" && (
          <LoginForm onModeChange={onModeChange} onClose={() => onOpenChange(false)} />
        )}
        {mode === "register-donor" && (
          <DonorRegisterForm onModeChange={onModeChange} onClose={() => onOpenChange(false)} />
        )}
        {mode === "register-volunteer" && (
          <VolunteerRegisterForm onModeChange={onModeChange} onClose={() => onOpenChange(false)} />
        )}
        {mode === "forgot-password" && (
          <ForgotPasswordForm onModeChange={onModeChange} />
        )}
        {mode === "reset-password" && (
          <ResetPasswordForm onModeChange={onModeChange} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function LoginForm({ onModeChange, onClose }: { onModeChange: (m: AuthMode) => void; onClose: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        toast.success(`Welcome back, ${result.user?.name}!`)
        onClose()
      } else {
        setError(result.error || "Login failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-primary" />
          Sign In
        </DialogTitle>
        <DialogDescription>
          Enter your credentials to access your dashboard
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => onModeChange("forgot-password")}
          >
            Forgot Password?
          </button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => onModeChange("register-donor")}
          >
            Register as Donor
          </button>
          {" or "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => onModeChange("register-volunteer")}
          >
            Volunteer
          </button>
        </div>
      </form>
    </>
  )
}

function DonorRegisterForm({ onModeChange, onClose }: { onModeChange: (m: AuthMode) => void; onClose: () => void }) {
  const { registerDonor } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await registerDonor(form.name, form.email, form.phone, form.address, form.password)
      if (result.success) {
        toast.success("Registration successful! Welcome aboard.")
        onClose()
      } else {
        setError(result.error || "Registration failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Register as Donor
        </DialogTitle>
        <DialogDescription>
          Create your donor account to start making donations
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="donor-name">Full Name</Label>
          <Input id="donor-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="donor-email">Email</Label>
          <Input id="donor-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="donor-phone">Phone</Label>
          <Input id="donor-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="donor-address">Address</Label>
          <Input id="donor-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="donor-password">Password</Label>
          <Input id="donor-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Donor Account"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onModeChange("login")}>Sign In</button>
          {" | "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onModeChange("register-volunteer")}>Register as Volunteer</button>
        </div>
      </form>
    </>
  )
}

function VolunteerRegisterForm({ onModeChange, onClose }: { onModeChange: (m: AuthMode) => void; onClose: () => void }) {
  const { registerVolunteer } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", phone: "", qualifications: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await registerVolunteer(form.name, form.email, form.phone, form.qualifications, form.password)
      if (result.success) {
        setSuccess(true)
        toast.info("Registration submitted! Please wait for admin approval.")
      } else {
        setError(result.error || "Registration failed")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Registration Submitted</DialogTitle>
          <DialogDescription>
            Your volunteer application has been submitted
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Pending Admin Approval</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An admin will review your qualifications and approve your account.
              You will be able to log in once approved.
            </p>
          </div>
          <Button variant="outline" onClick={() => onModeChange("login")}>
            Back to Sign In
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Register as Volunteer
        </DialogTitle>
        <DialogDescription>
          Apply to become a volunteer coordinator
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="vol-name">Full Name</Label>
          <Input id="vol-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vol-email">Email</Label>
          <Input id="vol-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vol-phone">Phone</Label>
          <Input id="vol-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vol-quals">Qualifications</Label>
          <Textarea id="vol-quals" placeholder="Describe your qualifications and experience..." value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vol-password">Password</Label>
          <Input id="vol-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onModeChange("login")}>Sign In</button>
          {" | "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => onModeChange("register-donor")}>Register as Donor</button>
        </div>
      </form>
    </>
  )
}
