import mongoose from "mongoose";

const pendingFileSchema = new mongoose.Schema({
  fileId: String,
  reason: String
});

export default mongoose.model("PendingFile", pendingFileSchema);
