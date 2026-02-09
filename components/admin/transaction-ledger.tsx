"use client"

import { useEffect, useState } from "react"
import { store } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Shield, Link2 } from "lucide-react"
import type { MonetaryDonation } from "@/lib/types"

export function TransactionLedger() {
  const [donations, setDonations] = useState<MonetaryDonation[]>([])

  useEffect(() => {
    store.getMonetaryDonations().then(setDonations)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Blockchain Ledger</h1>
        <p className="text-muted-foreground">
          All monetary transactions recorded on the blockchain
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-card-foreground">{donations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold text-card-foreground">
                {"৳"}{donations.reduce((s, d) => s + d.amount, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latest Block</p>
              <p className="text-2xl font-bold text-card-foreground">
                #{donations.length > 0 ? donations[0].blockNumber : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Records</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No blockchain transactions recorded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{"Block #"}</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">#{d.blockNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">
                        {d.txHash}
                      </TableCell>
                      <TableCell className="font-medium">{d.donorName}</TableCell>
                      <TableCell className="font-medium text-primary">
                        {"৳"}{d.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {d.method === "bkash" ? "bKash" : "Nagad"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success text-success-foreground">
                          Confirmed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(d.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
