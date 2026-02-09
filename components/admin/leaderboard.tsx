"use client"

import { useEffect, useState } from "react"
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

export function Leaderboard() {
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
          Top donors ranked by total contributions
        </p>
      </div>

      {/* Top 3 Cards */}
      {leaders.length >= 1 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {leaders.slice(0, 3).map((leader, i) => (
            <Card key={leader.donorId} className={i === 0 ? "border-2 border-accent" : ""}>
              <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  i === 0 ? "bg-accent/20" : "bg-muted"
                }`}>
                  {getRankIcon(i)}
                </div>
                <p className="font-semibold text-card-foreground">{leader.donorName}</p>
                <p className="text-2xl font-bold text-primary">
                  {"৳"}{leader.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leader.donationCount} donation{leader.donationCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Full Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {leaders.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No donations recorded yet
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
                  <TableRow key={leader.donorId}>
                    <TableCell>{getRankIcon(i)}</TableCell>
                    <TableCell className="font-medium">{leader.donorName}</TableCell>
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
