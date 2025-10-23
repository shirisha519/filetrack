import mongoose from "mongoose";
import dotenv from "dotenv";
import FileStatus from "./models/FileStatus.js";
import PendingFile from "./models/PendingFile.js";
import Inward from "./models/Inward.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await FileStatus.deleteMany({});
    await PendingFile.deleteMany({});
    await Inward.deleteMany({});

    // Seed Inwards
    const inwards = await Inward.insertMany([
      { inwardNo: "INW-001", section: "CP Camp", seatNo: "A1", fileNo: "F001", year: 2025, receivedFrom: "Officer A", subject: "Subject 1", date: new Date("2025-10-01") },
      { inwardNo: "INW-002", section: "Cyber Office", seatNo: "B1", fileNo: "F002", year: 2025, receivedFrom: "Officer B", subject: "Subject 2", date: new Date("2025-10-02") },
      { inwardNo: "INW-003", section: "CP Camp", seatNo: "A2", fileNo: "F003", year: 2025, receivedFrom: "Officer C", subject: "Subject 3", date: new Date("2025-10-03") }
    ]);

    console.log("Inwards seeded:", inwards.length);

    // Seed FileStatus
    const fileStatuses = await FileStatus.insertMany([
      { fileId: "F001", status: "Pending" },
      { fileId: "F002", status: "Approved" },
      { fileId: "F003", status: "Rejected" }
    ]);
    console.log("FileStatuses seeded:", fileStatuses.length);

    // Seed PendingFiles
    const pendingFiles = await PendingFile.insertMany([
      { fileId: "F001", reason: "Awaiting approval" },
      { fileId: "F003", reason: "Incomplete documentation" }
    ]);
    console.log("PendingFiles seeded:", pendingFiles.length);

    console.log("Seeding complete!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
