



import mongoose from "mongoose";

const inwardSchema = new mongoose.Schema({
  inwardNo: { type: String, required: true, unique: true },
  section: String,
  seatNo: String,
  fileNo: String,
  year: Number,
  receivedFrom: String,
  subject: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Inward", inwardSchema);
