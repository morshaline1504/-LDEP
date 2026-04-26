"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  LogOut,
  User,
  UserCog,
  Link2,
  Menu,
  X,
} from "lucide-react"
import type { ReactNode } from "react"
import type { Notification } from "@/lib/types"

interface NavItem {
  label: string
  value: string
  icon: ReactNode
}

interface DashboardShellProps {
  children: ReactNode
  navItems: NavItem[]
  activeTab: string
  onTabChange: (tab: string) => void
  roleLabel: string
}

export function DashboardShell({
  children,
  navItems,
  activeTab,
  onTabChange,
  roleLabel,
}: DashboardShellProps) {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  const loadNotifications = useCallback(async () => {
    if (!user) return
    const [count, notifs] = await Promise.all([
      store.getUnreadCount(user.id),
      store.getNotifications(user.id),
    ])
    setUnreadCount(count)
    setNotifications(notifs)
  }, [user])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(() => {
      if (!document.hidden) loadNotifications()
    }, 30000)
    

    return () => clearInterval(interval)
  }, [loadNotifications])

  if (!user) return null

  async function handleMarkAllRead() {
    await store.markAllNotificationsRead(user!.id)
    loadNotifications()
  }

  async function handleMarkRead(id: string) {
    await store.markNotificationRead(id, user!.id)
    loadNotifications()
  }

  async function handleDelete(id: string) {
    setRemovingIds((prev) => new Set(prev).add(id))
    setTimeout(async () => {
      try {
        await store.deleteNotification(id, user!.id)
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        setRemovingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        loadNotifications()
      } catch {
        setRemovingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    }, 300)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Link2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">DonateChain</span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {roleLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-xs font-normal text-primary hover:underline"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="max-h-64">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className="flex items-start gap-2 p-3 cursor-default transition-all duration-300"
                        style={{
                          opacity: removingIds.has(n.id) ? 0 : 1,
                          transform: removingIds.has(n.id)
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm block ${
                              n.read
                                ? "text-muted-foreground"
                                : "font-medium text-foreground"
                            }`}
                          >
                            {n.message}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                         
                         
                          
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative overflow-hidden rounded-full">
                  {user.profilePicture ? (
                    <img src={user.profilePicture || "/placeholder.svg"} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange("profile")}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden border-t border-border lg:block">
          <div className="flex gap-1 px-4">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onTabChange(item.value)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">Menu</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onTabChange(item.value)
                    setMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === item.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  )
}