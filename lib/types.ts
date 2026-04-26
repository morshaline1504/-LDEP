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
  serviceArea?: string
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
  method: "bkash" | "nagad" | "card" | "bank" | "sslcommerz" | "manual"
  phone: string
  txHash?: string
  blockNumber?: number
  manualTransactionId?: string
  sslTransactionId?: string
  cardType?: string
  cardBrand?: string
  cardIssuer?: string
  bankName?: string
  email?: string
  timestamp: string
  status: PaymentStatus
  verifiedAt?: string
  adminNote?: string
}

export interface PhysicalDonation {
  id: string
  donorId: string
  donorName: string
  type: string
  quantity: number
  condition: string
  foodType: string
  expiryDate: string | null
  location: string
  preferredDate: string | null
  timeSlot: string
  phone: string
  email: string
  photoUrl: string
  description: string
  specialInstructions: string
  rejectReason: string
  blockNumber?: string | null
txHash?: string | null
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
  donorLatitude?: number | null
  donorLongitude?: number | null
  deliveryLatitude?: number | null
  deliveryLongitude?: number | null
  volunteerLatitude?: number | null
  volunteerLongitude?: number | null
  pickupPhotoUrl?: string
  deliveryPhotoUrl?: string
      // ← add
  assignedAt: string
  
  completedAt?: string
  startedAt?: string
  donorPhone?: string        // ← add
  distance?: string          // ← add
  estimatedTime?: string 

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
