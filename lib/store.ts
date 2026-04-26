"use client"

import type {
  User,
  MonetaryDonation,
  PhysicalDonation,
  Task,
  Feedback,
  Notification,
} from "./types"

// Helper for API calls
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const store = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error, user: data.user }
      }
      return { success: true, user: data.user }
    } catch {
      return { success: false, error: "Network error. Please try again." }
    }
  },

  async registerDonor(
    name: string,
    email: string,
    phone: string,
    address: string,
    password: string
  ): Promise<User | null> {
    try {
      const data = await apiFetch<{ success: boolean; user: User }>("/api/auth/register/donor", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, address, password }),
      })
      return data.user
    } catch {
      return null
    }
  },

  async registerVolunteer(
    name: string,
    email: string,
    phone: string,
    qualifications: string,
    password: string,
    address?: string
  ): Promise<User | null> {
    try {
      const data = await apiFetch<{ success: boolean; user: User }>("/api/auth/register/volunteer", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, qualifications, password, address }),
      })
      return data.user
    } catch {
      return null
    }
  },

  // Admin: volunteer management
  async getPendingVolunteers(): Promise<User[]> {
    try {
      return await apiFetch<User[]>("/api/volunteers/pending")
    } catch {
      return []
    }
  },

  async getApprovedVolunteers(): Promise<User[]> {
    try {
      return await apiFetch<User[]>("/api/volunteers/approved")
    } catch {
      return []
    }
  },

  async approveVolunteer(id: string): Promise<void> {
    await apiFetch(`/api/volunteers/${id}/approve`, { method: "PUT" })
  },

  async rejectVolunteer(id: string): Promise<void> {
    await apiFetch(`/api/volunteers/${id}/reject`, { method: "PUT" })
  },

  // Monetary donations
  async createMonetaryDonation(
    donorId: string,
    donorName: string,
    amount: number,
    method: "bkash" | "nagad",
    phone: string
  ): Promise<MonetaryDonation> {
    return apiFetch<MonetaryDonation>("/api/donations/monetary", {
      method: "POST",
      body: JSON.stringify({ donorId, donorName, amount, method, phone }),
    })
  },

  async getMonetaryDonations(): Promise<MonetaryDonation[]> {
    try {
      return await apiFetch<MonetaryDonation[]>("/api/donations/monetary")
    } catch {
      return []
    }
  },

  async getDonorMonetaryDonations(donorId: string): Promise<MonetaryDonation[]> {
    try {
      return await apiFetch<MonetaryDonation[]>(`/api/donations/monetary/donor/${donorId}`)
    } catch {
      return []
    }
  },

  // Physical donations
 async createPhysicalDonation(
    donorId: string,
    donorName: string,
    type: string,
    quantity: number,
    condition: string,
    foodType: string,
    expiryDate: string | null,
    location: string,
    preferredDate: string | null,
    timeSlot: string,
    phone: string,
    email: string,
    description: string,
    photoUrl: string,
    specialInstructions: string
  ): Promise<PhysicalDonation> {
    return apiFetch<PhysicalDonation>("/api/donations/physical", {
      method: "POST",
      body: JSON.stringify({
        donorId,
        donorName,
        type,
        quantity,
        condition,
        foodType,
        expiryDate,
        location,
        preferredDate,
        timeSlot,
        phone,
        email,
        description,
        photoUrl,
        specialInstructions,
      }),
    })
  },

  async getPhysicalDonations(): Promise<PhysicalDonation[]> {
    try {
      return await apiFetch<PhysicalDonation[]>("/api/donations/physical")
    } catch {
      return []
    }
  },

  async getDonorPhysicalDonations(donorId: string): Promise<PhysicalDonation[]> {
    try {
      return await apiFetch<PhysicalDonation[]>(`/api/donations/physical/donor/${donorId}`)
    } catch {
      return []
    }
  },

  async approvePhysicalDonation(id: string): Promise<void> {
    await apiFetch(`/api/donations/physical/${id}/approve`, { method: "PUT" })
  },

  async rejectPhysicalDonation(id: string): Promise<void> {
    await apiFetch(`/api/donations/physical/${id}/reject`, { method: "PUT" })
  },

  // Tasks

 async createTask(
    donationId: string,
    volunteerId: string,
    deadline: string,
    distance?: string,
    estimatedTime?: string
  ): Promise<Task | null> {
    try {
      return await apiFetch<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ donationId, volunteerId, deadline, distance, estimatedTime }),
      })
    } 
    catch {
      return null
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      return await apiFetch<Task[]>("/api/tasks")
    } catch {
      return []
    }
  },

  async getVolunteerTasks(volunteerId: string): Promise<Task[]> {
    try {
      return await apiFetch<Task[]>(`/api/tasks/volunteer/${volunteerId}`)
    } catch {
      return []
    }
  },

  async getDonorTasks(donorId: string): Promise<Task[]> {
    try {
      return await apiFetch<Task[]>(`/api/tasks/donor/${donorId}`)
    } catch {
      return []
    }
  },

  async updateTaskStatus(taskId: string, status: "in-progress" | "completed", proofPhotoUrl?: string): Promise<void> {
    await apiFetch(`/api/tasks/${taskId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, proofPhotoUrl }),
    })
  },

  // Feedback
  async createFeedback(
    donorId: string,
    donorName: string,
    volunteerId: string,
    volunteerName: string,
    taskId: string,
    rating: number,
    comment: string
  ): Promise<Feedback> {
    return apiFetch<Feedback>("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ donorId, donorName, volunteerId, volunteerName, taskId, rating, comment }),
    })
  },

  async getFeedbacks(): Promise<Feedback[]> {
    try {
      return await apiFetch<Feedback[]>("/api/feedback")
    } catch {
      return []
    }
  },

  async getDonorFeedbacks(donorId: string): Promise<Feedback[]> {
    try {
      return await apiFetch<Feedback[]>(`/api/feedback/donor/${donorId}`)
    } catch {
      return []
    }
  },

  // Leaderboard
  async getLeaderboard(): Promise<{ donorId: string; donorName: string; totalAmount: number; donationCount: number }[]> {
    try {
      return await apiFetch("/api/donations/leaderboard")
    } catch {
      return []
    }
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      return await apiFetch<Notification[]>(`/api/notifications/${userId}`)
    } catch {
      return []
    }
  },
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await apiFetch(`/api/notifications/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({ id: notificationId }),
    })
  },

  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await apiFetch(`/api/notifications/${userId}/read/${notificationId}`, { method: "PUT" })
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await apiFetch(`/api/notifications/${userId}/read-all`, { method: "PUT" })
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const data = await apiFetch<{ count: number }>(`/api/notifications/${userId}/unread-count`)
      return data.count
    } catch {
      return 0
    }
  },

  // Stats
  async getStats(): Promise<{
    totalDonors: number
    totalVolunteers: number
    pendingVolunteers: number
    totalMonetary: number
    totalPhysicalDonations: number
    pendingPhysicalDonations: number
    totalTasks: number
    completedTasks: number
    pendingTasks: number
  }> {
    try {
      return await apiFetch("/api/stats")
    } catch {
      return {
        totalDonors: 0,
        totalVolunteers: 0,
        pendingVolunteers: 0,
        totalMonetary: 0,
        totalPhysicalDonations: 0,
        pendingPhysicalDonations: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      }
    }
  },

  // Chart Stats
  async getChartStats(): Promise<{
    trends: { month: string; monetary: number; physical: number; donors: number }[]
    donationTypes: { name: string; value: number }[]
    categories: { name: string; value: number }[]
    volunteerPerformance: { name: string; tasks: number }[]
    areas: { name: string; value: number; count: number }[]
    totals: { monetary: number; physical: number; activeDonors: number }
  }> {
    try {
      return await apiFetch("/api/stats/charts")
    } catch {
      return {
        trends: [],
        donationTypes: [],
        categories: [],
        volunteerPerformance: [],
        areas: [],
        totals: { monetary: 0, physical: 0, activeDonors: 0 }
      }
    }
  },

  // Profile
  async getProfile(userId: string): Promise<User | null> {
    try {
      return await apiFetch<User>(`/api/auth/profile?userId=${userId}`)
    } catch {
      return null
    }
  },

  async updateProfile(data: {
    userId: string
    name?: string
    phone?: string
    address?: string
    qualifications?: string
    bio?: string
    profilePicture?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        return { success: false, error: result.error }
      }
      return { success: true, user: result.user }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  // Forgot / Reset Password
  async forgotPassword(email: string): Promise<{ success: boolean; userId?: string; userName?: string; error?: string }> {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, userId: data.userId, userName: data.userName }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  async resetPassword(userId: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  // Seed
  async seedDatabase(): Promise<boolean> {
    try {
      await apiFetch("/api/seed", { method: "POST" })
      return true
    } catch {
      return false
    }
  },

  // Volunteer Location Tracking
  async updateVolunteerLocation(
    volunteerId: string,
    lat: number,
    lng: number
  ): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      const res = await fetch("/api/volunteer/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, lat, lng }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, taskId: data.taskId }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  async getActiveVolunteerLocations(): Promise<
    {
      taskId: string
      volunteerId: string
      volunteerName: string
      donationType: string
      donorName: string
      location: string
      volunteerLatitude: number | null
      volunteerLongitude: number | null
      donorLatitude: number | null
      donorLongitude: number | null
      status: string
      updatedAt: string
    }[]
  > {
    try {
      return await apiFetch("/api/volunteer/location")
    } catch {
      return []
    }
  },

  async getTaskLocation(taskId: string): Promise<{
    taskId: string
    volunteerId: string
    volunteerName: string
    donationType: string
    donorName: string
    location: string
    volunteerLatitude: number | null
    volunteerLongitude: number | null
    donorLatitude: number | null
    donorLongitude: number | null
    deliveryLatitude: number | null
    deliveryLongitude: number | null
    status: string
    distanceKm: number | null
    updatedAt: string
  } | null> {
    try {
      return await apiFetch(`/api/volunteer/location/${taskId}`)
    } catch {
      return null
    }
  },

  // Get proof photos for donor's tasks
  async getDonorTaskProofs(donorId: string): Promise<{
    taskId: string
    donationType: string
    location: string
    volunteerName: string
    status: string
    pickupPhotoUrl: string
    deliveryPhotoUrl: string
    completedAt: string | null
  }[]> {
    try {
      return await apiFetch(`/api/tasks/donor/${donorId}/proofs`)
    } catch {
      return []
    }
  },

  // Get task by ID
  async getTask(taskId: string): Promise<Task | null> {
    try {
      return await apiFetch(`/api/tasks/${taskId}`)
    } catch {
      return null
    }
  },

  // Get nearest volunteers for smart assignment
  async getNearestVolunteers(
    latitude: number,
    longitude: number,
    maxDistance?: number,
    limit?: number
  ): Promise<{
    id: string
    name: string
    email: string
    phone: string
    qualifications: string
    serviceArea: string
    latitude: number
    longitude: number
    distance: number
    distanceFormatted: string
    estimatedTime: string
  }[]> {
    try {
      const data = await apiFetch<{ success: boolean; volunteers: any[] }>("/api/volunteers/nearest", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude, maxDistance, limit }),
      })
      return data.volunteers || []
    } catch {
      return []
    }
  },

  // Get volunteer stats (completion rate, avg delivery time, ratings)
  
     
    

  // Referral system
  async getReferralInfo(userId: string): Promise<{
    referralCode: string
    referralPoints: number
    referredBy: { name: string; email: string } | null
    referredUsers: { name: string; email: string; joinedAt: string }[]
    totalReferrals: number
  } | null> {
    try {
      return await apiFetch(`/api/referral/${userId}`)
    } catch {
      return null
    }
  },

  async applyReferral(userId: string, referralCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/referral/" + userId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  async generateReferralCode(userId: string): Promise<{ success: boolean; referralCode?: string; error?: string }> {
    try {
      const res = await fetch(`/api/referral/${userId}`, {
        method: "PUT",
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, referralCode: data.referralCode }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  // Contact Messages
  async sendContactMessage(name: string, email: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  },

  async getContactMessages(): Promise<{ _id: string; name: string; email: string; message: string; isRead: boolean; createdAt: string }[]> {
    try {
      const data = await apiFetch<{ messages: any[] }>("/api/contact")
      return data.messages || []
    } catch {
      return []
    }
  },

  async markContactMessageRead(messageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiFetch(`/api/contact/${messageId}`, { method: "PATCH" })
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark message as read"
      return { success: false, error: errorMessage }
    }
  },

  async deleteContactMessage(messageId: string): Promise<void> {
    await apiFetch(`/api/contact/${messageId}`, { method: "DELETE" })
  },

}
