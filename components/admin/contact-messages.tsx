"use client"

import { useState, useEffect } from "react"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Mail, Eye, Send, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface Message {
  _id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export function ContactMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replySending, setReplySending] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    setLoading(true)
    try {
      const data = await store.getContactMessages()
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function openReview(message: Message) {
    // Mark as read when opening review
    if (!message.isRead) {
      const result = await store.markContactMessageRead(message._id)
      if (result.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, isRead: true } : m))
        )
      }
    }
    setSelectedMessage(message)
    setReplyText("")
    setReviewOpen(true)
  }

  async function handleReply() {
    if (!selectedMessage || !replyText.trim()) {
      toast.error("Please write a reply message")
      return
    }

    setReplySending(true)
    try {
      // Send reply email via API
      const res = await fetch("/api/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: selectedMessage.email,
          toName: selectedMessage.name,
          originalMessage: selectedMessage.message,
          replyMessage: replyText,
          adminName: user?.name || "HopeBridge Admin",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reply")
      }

      // Trigger notification for admin (confirmation)
      if (user?.id) {
        // We post a notification to the admin acknowledging the reply was sent
        await fetch("/api/notifications/" + user.id, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Reply sent to ${selectedMessage.name} (${selectedMessage.email})`,
            type: "info",
          }),
        }).catch(() => {
          // Notification failure is non-blocking
        })
      }

      toast.success(
        "Alright, I understand and I'll follow your suggestions. I'll work on implementing these improvements properly so that it doesn't cause any issues in the future."
      )
      setReplyText("")
      setReviewOpen(false)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to send reply"
      toast.error(msg)
    } finally {
      setReplySending(false)
    }
  }

  async function deleteMessage(messageId: string) {
    if (!confirm("Are you sure you want to delete this message?")) return
    try {
      await store.deleteContactMessage(messageId)
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null)
        setReviewOpen(false)
      }
      toast.success("Message deleted")
    } catch {
      toast.error("Failed to delete message")
    }
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading messages...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>Contact Messages</span>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-30" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Messages from the contact form will appear here</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow
                      key={message._id}
                      className={`transition-colors ${!message.isRead ? "bg-primary/5 font-medium" : ""}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[120px]">{message.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[180px]">
                        {message.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <span className="truncate block max-w-[300px]">{message.message}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(message.createdAt).toLocaleDateString("en-BD", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {message.isRead ? (
                          <Badge variant="secondary" className="text-xs">Read</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => openReview(message)}
                            title="Review & Reply"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMessage(message._id)}
                            title="Delete message"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review & Reply Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Message Details & Reply
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-5">
              {/* Sender Info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedMessage.email}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(selectedMessage.createdAt).toLocaleString("en-BD")}
                </p>
              </div>

              {/* Original Message */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Original Message
                </Label>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Section */}
              <div className="space-y-2">
                <Label htmlFor="reply-text" className="text-sm font-medium text-foreground">
                  Your Reply
                  <span className="text-muted-foreground font-normal ml-1">
                    — will be sent to {selectedMessage.email}
                  </span>
                </Label>
                <Textarea
                  id="reply-text"
                  placeholder="Write your reply here..."
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="border-border focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewOpen(false)}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
            <Button
              onClick={handleReply}
              disabled={replySending || !replyText.trim()}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
            >
              {replySending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}