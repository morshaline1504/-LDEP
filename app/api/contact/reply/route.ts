import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const { toEmail, toName, replyMessage, adminName } = await req.json()

    if (!toEmail || !replyMessage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"${adminName || "HopeBridge Admin"}" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: "Reply to your message — HopeBridge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Message from Admin</h2>
          <p>Dear ${toName || "User"},</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${replyMessage.replace(/\n/g, "<br/>")}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an official reply from the HopeBridge admin team.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}