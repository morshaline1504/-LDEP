"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User } from "./types"
import { store } from "./store"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  registerDonor: (name: string, email: string, phone: string, address: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  registerVolunteer: (name: string, email: string, phone: string, qualifications: string, password: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (updatedUser: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = "donation_exchange_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await store.login(email, password)
      if (result.success && result.user) {
        setUser(result.user)
        localStorage.setItem(AUTH_KEY, JSON.stringify(result.user))
      }
      return result
    },
    []
  )

  const registerDonor = useCallback(
    async (name: string, email: string, phone: string, address: string, password: string) => {
      const regUser = await store.registerDonor(name, email, phone, address, password)
      if (!regUser) {
        return { success: false, error: "An account with this email already exists." }
      }
      // Auto-login after donor registration
      const loginResult = await store.login(email, password)
      if (loginResult.success && loginResult.user) {
        setUser(loginResult.user)
        localStorage.setItem(AUTH_KEY, JSON.stringify(loginResult.user))
      }
      return { success: true, user: regUser }
    },
    []
  )

  const registerVolunteer = useCallback(
    async (name: string, email: string, phone: string, qualifications: string, password: string) => {
      const regUser = await store.registerVolunteer(name, email, phone, qualifications, password)
      if (!regUser) {
        return { success: false, error: "An account with this email already exists." }
      }
      return { success: true }
    },
    []
  )

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, registerDonor, registerVolunteer, updateUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
