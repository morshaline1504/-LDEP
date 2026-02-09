"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { store } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Shield, CheckCircle, Link2 } from "lucide-react"

type Step = "form" | "otp" | "pin" | "processing" | "receipt"

export function MonetaryDonation() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>("form")
  const [method, setMethod] = useState<"bkash" | "nagad">("bkash")
  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [pin, setPin] = useState("")
  const [receipt, setReceipt] = useState<{
    txHash: string
    blockNumber: number
    amount: number
    timestamp: string
  } | null>(null)

  if (!user) return null

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !phone) {
      toast.error("Please fill in all fields.")
      return
    }
    setStep("otp")
    toast.info("OTP sent to your phone number.")
  }

  function handleVerifyOtp() {
    if (otp.length < 4) {
      toast.error("Please enter the complete OTP.")
      return
    }
    setStep("pin")
  }

  function handleConfirmPin() {
    if (pin.length < 4) {
      toast.error("Please enter your PIN.")
      return
    }
    setStep("processing")

    // Simulate blockchain processing then call API
    setTimeout(async () => {
      if (!user) return
      try {
        const donation = await store.createMonetaryDonation(
          user.id,
          user.name,
          Number.parseFloat(amount),
          method,
          phone
        )
        setReceipt({
          txHash: donation.txHash,
          blockNumber: donation.blockNumber,
          amount: donation.amount,
          timestamp: donation.timestamp,
        })
        setStep("receipt")
        toast.success("Donation recorded on the blockchain!")
      } catch {
        toast.error("Failed to process donation. Please try again.")
        setStep("form")
      }
    }, 2000)
  }

  function handleReset() {
    setStep("form")
    setAmount("")
    setPhone("")
    setOtp("")
    setPin("")
    setReceipt(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Make a Donation</h1>
        <p className="text-muted-foreground">
          Donate securely via mobile financial services with blockchain verification
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Choose your payment method and enter the amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={method}
                  onValueChange={(v) => setMethod(v as "bkash" | "nagad")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="cursor-pointer font-medium">
                      bKash
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nagad" id="nagad" />
                    <Label htmlFor="nagad" className="cursor-pointer font-medium">
                      Nagad
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="donation-amount">Amount (BDT)</Label>
                <Input
                  id="donation-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                  disabled={step !== "form"}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="donation-phone">Phone Number</Label>
                <Input
                  id="donation-phone"
                  placeholder="+880-1XXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={step !== "form"}
                />
              </div>

              {step === "form" && (
                <Button type="submit" className="w-full">
                  Proceed to Payment
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Blockchain Security
            </CardTitle>
            <CardDescription>
              Your donation is protected by blockchain technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { step: "1", label: "Enter payment details" },
                { step: "2", label: "Verify with OTP" },
                { step: "3", label: "Confirm with PIN" },
                { step: "4", label: "Smart contract executes" },
                { step: "5", label: "Transaction recorded on blockchain" },
                { step: "6", label: "Receipt generated automatically" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {s.step}
                  </div>
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OTP Dialog */}
      <Dialog open={step === "otp"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              A verification code has been sent to {phone}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Demo: Enter any 6 digits
            </p>
            <Button onClick={handleVerifyOtp} className="w-full">
              Verify OTP
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Dialog */}
      <Dialog open={step === "pin"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter PIN</DialogTitle>
            <DialogDescription>
              {"Enter your "}{method === "bkash" ? "bKash" : "Nagad"}{" PIN to confirm payment of ৳"}{Number.parseFloat(amount || "0").toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Demo: Enter any 4 digits
            </p>
            <Button onClick={handleConfirmPin} className="w-full">
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Dialog */}
      <Dialog open={step === "processing"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Processing Payment</DialogTitle>
            <DialogDescription className="sr-only">
              Your transaction is being processed on the blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-medium text-foreground">Processing on Blockchain</p>
            <p className="text-sm text-muted-foreground">
              Smart contract executing... validating transaction...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={step === "receipt"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Donation Successful
            </DialogTitle>
            <DialogDescription>
              Your transaction has been recorded on the blockchain
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold text-primary">
                      {"৳"}{receipt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <Badge variant="secondary">
                      {method === "bkash" ? "bKash" : "Nagad"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{"Block #"}</span>
                    <span className="font-mono text-sm">#{receipt.blockNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Tx Hash</span>
                    <span className="break-all font-mono text-xs text-foreground">
                      {receipt.txHash}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Timestamp</span>
                    <span className="text-sm">
                      {new Date(receipt.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  This transaction is permanently recorded on the blockchain
                </span>
              </div>
              <Button onClick={handleReset} className="w-full">
                Make Another Donation
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
