"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trophy, Medal, Award } from "lucide-react"

export function DonorLeaderboard() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState<{ donorId: string; donorName: string; totalAmount: number; donationCount: number }[]>([])

  useEffect(() => {
    store.getLeaderboard().then(setLeaders)
  }, [])

  function getRankIcon(index: number) {
    if (index === 0) return <Trophy className="h-5 w-5 text-accent" />
    if (index === 1) return <Medal className="h-5 w-5 text-muted-foreground" />
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />
    return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Donor Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank among fellow donors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {leaders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No donations recorded yet. Be the first!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Donations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaders.map((leader, i) => (
                  <TableRow
                    key={leader.donorId}
                    className={
                      leader.donorId === user?.id
                        ? "bg-primary/5"
                        : ""
                    }
                  >
                    <TableCell>{getRankIcon(i)}</TableCell>
                    <TableCell className="font-medium">
                      {leader.donorName}
                      {leader.donorId === user?.id && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {"৳"}{leader.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>{leader.donationCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
