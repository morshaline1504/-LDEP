"use client"

import { useState, useEffect, useCallback } from "react"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react"
import type { User } from "@/lib/types"

export function VolunteerManagement() {
  const [pending, setPending] = useState<User[]>([])
  const [approved, setApproved] = useState<User[]>([])

  const loadData = useCallback(async () => {
    const [p, a] = await Promise.all([
      store.getPendingVolunteers(),
      store.getApprovedVolunteers(),
    ])
    setPending(p)
    setApproved(a)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleApprove(id: string, name: string) {
    await store.approveVolunteer(id)
    toast.success(`${name} has been approved as a volunteer.`)
    loadData()
  }

  async function handleReject(id: string, name: string) {
    await store.rejectVolunteer(id)
    toast.error(`${name}'s application has been rejected.`)
    loadData()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Volunteer Management</h1>
        <p className="text-muted-foreground">
          Review, approve, or reject volunteer registrations
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Approved ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No pending volunteer applications
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Qualifications</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.name}</TableCell>
                          <TableCell>{v.email}</TableCell>
                          <TableCell>{v.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{v.qualifications}</TableCell>
                          <TableCell>{new Date(v.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleApprove(v.id, v.name)}>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(v.id, v.name)}>
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
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
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approved Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              {approved.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No approved volunteers yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Qualifications</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approved.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.name}</TableCell>
                          <TableCell>{v.email}</TableCell>
                          <TableCell>{v.phone}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{v.qualifications}</TableCell>
                          <TableCell>
                            <Badge className="bg-success text-success-foreground">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
