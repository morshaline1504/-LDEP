export type UserRole = "admin" | "donor" | "volunteer"

export type VolunteerStatus = "pending" | "approved" | "rejected"
export type DonationStatus = "pending" | "approved" | "rejected"
export type TaskStatus = "pending" | "in-progress" | "completed"
export type PaymentStatus = "completed" | "pending" | "failed"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  password: string
  address?: string
  qualifications?: string
  bio?: string
  profilePicture?: string
  volunteerStatus?: VolunteerStatus
  createdAt: string
}

export interface MonetaryDonation {
  id: string
  donorId: string
  donorName: string
  amount: number
  method: "bkash" | "nagad"
  phone: string
  txHash: string
  blockNumber: number
  timestamp: string
  status: PaymentStatus
}

export interface PhysicalDonation {
  id: string
  donorId: string
  donorName: string
  type: string
  quantity: number
  location: string
  photoUrl: string
  description: string
  status: DonationStatus
  createdAt: string
}

export interface Task {
  id: string
  donationId: string
  volunteerId: string
  volunteerName: string
  donorName: string
  donationType: string
  location: string
  deadline: string
  status: TaskStatus
  proofPhotoUrl?: string
  assignedAt: string
  completedAt?: string
}

export interface Feedback {
  id: string
  donorId: string
  donorName: string
  volunteerId: string
  volunteerName: string
  taskId: string
  rating: number
  comment: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  read: boolean
  createdAt: string
}
