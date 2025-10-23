import mongoose from "mongoose";

const fileStatusSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  status: { type: String, required: true }
});

export default mongoose.model("FileStatus", fileStatusSchema);
