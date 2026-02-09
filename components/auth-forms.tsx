"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { store } from "@/lib/store"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"

type AuthMode = "login" | "register-donor" | "register-volunteer" | "forgot-password" | "reset-password"

export function ForgotPasswordForm({ onModeChange }: { onModeChange: (m: AuthMode) => void }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await store.forgotPassword(email)
      if (result.success && result.userId) {
        // Store the userId and email in sessionStorage for the reset step
        sessionStorage.setItem("reset_user_id", result.userId)
        sessionStorage.setItem("reset_user_name", result.userName || "")
        sessionStorage.setItem("reset_user_email", email)
        toast.success("Email verified! Now set your new password.")
        onModeChange("reset-password")
      } else {
        setError(result.error || "Email not found")
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
          <KeyRound className="h-5 w-5 text-primary" />
          Forgot Password
        </DialogTitle>
        <DialogDescription>
          Enter the email you used to register. We will verify your account.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">Email Address</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            onClick={() => onModeChange("login")}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Sign In
          </button>
        </div>
      </form>
    </>
  )
}

export function ResetPasswordForm({ onModeChange }: { onModeChange: (m: AuthMode) => void }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const userName = typeof window !== "undefined" ? sessionStorage.getItem("reset_user_name") || "" : ""
  const userEmail = typeof window !== "undefined" ? sessionStorage.getItem("reset_user_email") || "" : ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }

    setLoading(true)
    try {
      const userId = sessionStorage.getItem("reset_user_id") || ""
      const result = await store.resetPassword(userId, newPassword, confirmPassword)
      if (result.success) {
        setSuccess(true)
        toast.success("Password reset successful!")
        // Clean up
        sessionStorage.removeItem("reset_user_id")
        sessionStorage.removeItem("reset_user_name")
        sessionStorage.removeItem("reset_user_email")
      } else {
        setError(result.error || "Failed to reset password")
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
          <DialogTitle>Password Reset Successful</DialogTitle>
          <DialogDescription>
            Your password has been updated
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">All Done!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your password has been reset successfully. You can now login with your new password.
            </p>
          </div>
          <Button onClick={() => onModeChange("login")} className="w-full">
            Go to Sign In
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Reset Password
        </DialogTitle>
        <DialogDescription>
          {userName ? `Hi ${userName}, set` : "Set"} your new password for {userEmail}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            onClick={() => onModeChange("forgot-password")}
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
        </div>
      </form>
    </>
  )
}
