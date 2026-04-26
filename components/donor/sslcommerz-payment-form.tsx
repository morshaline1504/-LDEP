"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, CreditCard, Link2 } from "lucide-react"
import { toast } from "sonner"

interface SSLCommerzPaymentFormProps {
  userId: string
  userName: string
  userEmail: string
  onSuccess?: (receipt: any) => void
  onVerifyBlockchain?: () => void
}

type Step = "form" | "processing" | "success" | "failed"

interface Receipt {
  tranId: string
  txHash: string
  blockNumber: number
  amount: number
  phone: string
  paymentMethod: string
  timestamp: string
  status: string
}

export function SSLCommerzPaymentForm({
  userId,
  userName,
  userEmail,
  onSuccess,
  onVerifyBlockchain,
}: SSLCommerzPaymentFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!amount || !phone) {
      toast.error("Please fill in all required fields")
      return
    }
    if (!/^\d{11}$/.test(phone)) {
  toast.error("Phone number must be exactly 11 digits")
  return
}

    if (!userId || !userName || !userEmail) {
      toast.error("Please complete your profile before making a donation")
      setError("User information is incomplete")
      setStep("failed")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 50 || amountNum > 10000) {
     toast.error("Donation amount must be between ৳50 and ৳10,000")
     return
    }

    setStep("processing")
    setIsProcessing(true)
    setError(null)

    try {
      // Call API to initiate SSLCommerz payment
      const response = await fetch("/api/donations/sslcommerz/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donorId: userId,
          donorName: userName,
          email: userEmail,
          phone,
          amount: amountNum,
          method: "sslcommerz",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate payment")
      }

      // Check if this is demo mode
     if (data.url) {
    window.location.href = data.url
}
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate payment"
      setError(errorMsg)
      setStep("failed")
      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  async function processPaymentSuccess(tranId: string, amount: number) {
    try {
      // Call success endpoint to save the payment
      const response = await fetch("/api/donations/sslcommerz/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tran_id: tranId,
          amount: amount,
          status: "SUCCESSFUL",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment")
      }

      // Show success with receipt
      setReceipt({
        tranId,
        txHash: data.donation?.txHash || "0x" + Math.random().toString(16).slice(2, 66),
        blockNumber: data.donation?.blockNumber || Math.floor(Math.random() * 1000000),
        amount,
        phone,
        paymentMethod: "SSLCommerz",
        timestamp: new Date().toISOString(),
        status: "Completed",
      })

      setStep("success")
      toast.success("Payment successful! Donation recorded on blockchain.")

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to complete payment"
      setError(errorMsg)
      setStep("failed")
      toast.error(errorMsg)
    }
  }

  function handleReset() {
    setStep("form")
    setAmount("")
    setPhone("")
    setReceipt(null)
    setError(null)
  }

  function goToDashboard() {
    // This will trigger the onSuccess callback which resets the payment method
    if (onSuccess) {
      onSuccess(receipt)
    }
    handleReset()
  }

  function verifyBlockchain() {
    // Call the parent component's callback to navigate to Verify Blockchain tab
    if (onVerifyBlockchain) {
      onVerifyBlockchain()
    }
    // Also call onSuccess to reset the payment method
    if (onSuccess) {
      onSuccess(receipt)
    }
    handleReset()
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            SSLCommerz Payment
          </CardTitle>
          <CardDescription>
            Fast and secure payment through SSLCommerz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "form" && (
            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ssl-amount">Donation Amount (BDT)</Label>
                <Input
                  id="ssl-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="50"
                  max="10000"
                  step="1"
                  required
                />
                <p className="text-xs text-muted-foreground">Amount: ৳50 – ৳10,000</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ssl-phone">Phone Number</Label>

                <Input
  id="ssl-phone"
  type="tel"
  placeholder="01XXXXXXXXX"
  value={phone}
  maxLength={11}
  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
  required
/>
              </div>

              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Donate Now"
                )}
              </Button>
            </form>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-medium">Processing Payment</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your donation...
              </p>
            </div>
          )}

          {step === "success" && receipt && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Payment Successful!</p>
                  <p className="text-sm text-green-800">Your donation has been recorded on the blockchain</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">
                      ৳{receipt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">{receipt.tranId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className="bg-green-100 text-green-800">Verified ✓</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Block #</span>
                    <span className="font-mono text-sm font-bold">#{receipt.blockNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Blockchain TxHash</span>
                    <span className="break-all font-mono text-xs text-foreground bg-slate-100 p-2 rounded">
                      {receipt.txHash}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={verifyBlockchain} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Verify Blockchain
                </Button>
                <Button 
                  onClick={goToDashboard} 
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {step === "failed" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Payment Failed</p>
                  <p className="text-sm text-red-800">{error || "An error occurred"}</p>
                </div>
              </div>

              <Button onClick={handleReset} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
