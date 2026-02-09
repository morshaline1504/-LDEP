import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/server/models/User";
import MonetaryDonation from "@/server/models/MonetaryDonation";
import PhysicalDonation from "@/server/models/PhysicalDonation";
import Task from "@/server/models/Task";
import Notification from "@/server/models/Notification";
import Feedback from "@/server/models/Feedback";
import donationBlockchain from "@/server/blockchain/blockchain";

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      MonetaryDonation.deleteMany({}),
      PhysicalDonation.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({}),
    ]);

    // Create users
    const admin = await User.create({
      name: "System Admin",
      email: "bsse1504@iit.du.ac.bd",
      phone: "+880-1700-000000",
      role: "admin",
      password: "bsse1504",
    });

    const donor1 = await User.create({
      name: "Rahim Ahmed",
      email: "rahim@example.com",
      phone: "+880-1711-111111",
      role: "donor",
      password: "donor123",
      address: "Dhaka, Bangladesh",
    });

    const donor2 = await User.create({
      name: "Fatima Khatun",
      email: "fatima@example.com",
      phone: "+880-1722-222222",
      role: "donor",
      password: "donor123",
      address: "Chittagong, Bangladesh",
    });

    const vol1 = await User.create({
      name: "Karim Uddin",
      email: "karim@example.com",
      phone: "+880-1733-333333",
      role: "volunteer",
      password: "vol123",
      qualifications: "Community Service, First Aid Certified",
      volunteerStatus: "approved",
    });

    await User.create({
      name: "Nasreen Begum",
      email: "nasreen@example.com",
      phone: "+880-1744-444444",
      role: "volunteer",
      password: "vol123",
      qualifications: "Social Work Degree",
      volunteerStatus: "pending",
    });

    // Create monetary donations with blockchain records
    const block1 = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId: donor1._id.toString(),
      donorName: "Rahim Ahmed",
      amount: 5000,
      method: "bkash",
    });
    await MonetaryDonation.create({
      donorId: donor1._id,
      donorName: "Rahim Ahmed",
      amount: 5000,
      method: "bkash",
      phone: "+880-1711-111111",
      txHash: `0x${block1.hash}`,
      blockNumber: block1.index,
      status: "completed",
    });

    const block2 = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId: donor2._id.toString(),
      donorName: "Fatima Khatun",
      amount: 10000,
      method: "nagad",
    });
    await MonetaryDonation.create({
      donorId: donor2._id,
      donorName: "Fatima Khatun",
      amount: 10000,
      method: "nagad",
      phone: "+880-1722-222222",
      txHash: `0x${block2.hash}`,
      blockNumber: block2.index,
      status: "completed",
    });

    const block3 = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId: donor1._id.toString(),
      donorName: "Rahim Ahmed",
      amount: 3000,
      method: "bkash",
    });
    await MonetaryDonation.create({
      donorId: donor1._id,
      donorName: "Rahim Ahmed",
      amount: 3000,
      method: "bkash",
      phone: "+880-1711-111111",
      txHash: `0x${block3.hash}`,
      blockNumber: block3.index,
      status: "completed",
    });

    // Create physical donations
    const pd1 = await PhysicalDonation.create({
      donorId: donor1._id,
      donorName: "Rahim Ahmed",
      type: "Clothing",
      quantity: 50,
      location: "Mirpur, Dhaka",
      description: "Winter clothing for children",
      status: "approved",
    });

    await PhysicalDonation.create({
      donorId: donor2._id,
      donorName: "Fatima Khatun",
      type: "Food Supplies",
      quantity: 100,
      location: "Agrabad, Chittagong",
      description: "Rice and lentils packages",
      status: "pending",
    });

    // Create task
    await Task.create({
      donationId: pd1._id,
      volunteerId: vol1._id,
      volunteerName: "Karim Uddin",
      donorName: "Rahim Ahmed",
      donationType: "Clothing",
      location: "Mirpur, Dhaka",
      deadline: new Date(Date.now() + 5 * 86400000),
      status: "in-progress",
      assignedAt: new Date(Date.now() - 10 * 86400000),
    });

    // Create a welcome notification for admin
    await Notification.create({
      userId: admin._id,
      message: "Welcome to DonateChain! The system has been seeded with demo data.",
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      credentials: {
        admin: "bsse1504@iit.du.ac.bd / bsse1504",
        donor1: "rahim@example.com / donor123",
        donor2: "fatima@example.com / donor123",
        volunteer: "karim@example.com / vol123",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
