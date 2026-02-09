import mongoose from "mongoose";
import User from "./models/User.js";
import MonetaryDonation from "./models/MonetaryDonation.js";
import PhysicalDonation from "./models/PhysicalDonation.js";
import Task from "./models/Task.js";
import Notification from "./models/Notification.js";
import Feedback from "./models/Feedback.js";
import donationBlockchain from "./blockchain/blockchain.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/donatechain";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      MonetaryDonation.deleteMany({}),
      PhysicalDonation.deleteMany({}),
      Task.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

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

    const vol2 = await User.create({
      name: "Nasreen Begum",
      email: "nasreen@example.com",
      phone: "+880-1744-444444",
      role: "volunteer",
      password: "vol123",
      qualifications: "Social Work Degree",
      volunteerStatus: "pending",
    });

    console.log("Users created.");

    // Create monetary donations with blockchain records
    const block1 = donationBlockchain.addBlock({
      type: "monetary_donation",
      donorId: donor1._id.toString(),
      donorName: "Rahim Ahmed",
      amount: 5000,
      method: "bkash",
    });
    const md1 = await MonetaryDonation.create({
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
    const md2 = await MonetaryDonation.create({
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
    const md3 = await MonetaryDonation.create({
      donorId: donor1._id,
      donorName: "Rahim Ahmed",
      amount: 3000,
      method: "bkash",
      phone: "+880-1711-111111",
      txHash: `0x${block3.hash}`,
      blockNumber: block3.index,
      status: "completed",
    });

    console.log("Monetary donations created with blockchain records.");

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

    const pd2 = await PhysicalDonation.create({
      donorId: donor2._id,
      donorName: "Fatima Khatun",
      type: "Food Supplies",
      quantity: 100,
      location: "Agrabad, Chittagong",
      description: "Rice and lentils packages",
      status: "pending",
    });

    console.log("Physical donations created.");

    // Create task
    const task1 = await Task.create({
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

    console.log("Tasks created.");
    console.log("");
    console.log("Seed completed successfully!");
    console.log(`Blockchain chain length: ${donationBlockchain.getChainLength()}`);
    console.log(`Blockchain valid: ${donationBlockchain.isChainValid()}`);
    console.log("");
    console.log("Login credentials:");
    console.log("  Admin: bsse1504@iit.du.ac.bd / bsse1504");
    console.log("  Donor: rahim@example.com / donor123");
    console.log("  Donor: fatima@example.com / donor123");
    console.log("  Volunteer: karim@example.com / vol123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
