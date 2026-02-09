"use client"

import React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Camera, Save, User as UserIcon, Mail, Phone, MapPin, Award, FileText } from "lucide-react"

export function ProfileSettings() {
  const { user, updateUser } = useAuth()
  
  if (!user) return null

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    qualifications: user.qualifications || "",
    bio: user.bio || "",
  })
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "")
  const [saving, setSaving] = useState(false)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setProfilePicture(base64)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const result = await store.updateProfile({
        userId: user.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        qualifications: form.qualifications,
        bio: form.bio,
        profilePicture,
      })
      if (result.success && result.user) {
        updateUser(result.user)
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-muted">
                  {profilePicture ? (
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">Click the camera icon to upload a picture (max 2MB)</p>
            </div>

            <Separator />

            {/* Account Info (read-only) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>Role</span>
              </div>
              <p className="rounded-md bg-muted px-3 py-2 text-sm capitalize text-foreground">{user.role}</p>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            {(user.role === "donor" || user.role === "admin") && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="profile-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            )}

            {user.role === "volunteer" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-qualifications" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Qualifications
                </Label>
                <Textarea
                  id="profile-qualifications"
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="profile-bio"
                placeholder="Tell us a bit about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>

            <Separator />

            {/* Member Since */}
            <div className="text-sm text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
