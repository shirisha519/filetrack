import FileStatus from "../models/FileStatus.js";
import Inward from "../models/Inward.js";
import PendingFile from "../models/PendingFile.js";

// Get all files (for dropdown)
export const getAllFiles = async (req, res) => {
  const files = await Inward.find().select("fileNo -_id"); // return only fileNo
  res.json(files.map(f => f.fileNo));
};

// Get all file statuses
export const getFileStatuses = async (req, res) => {
  const data = await FileStatus.find();
  res.json(data);
};

// Update status for a selected file
export const updateFileStatus = async (req, res) => {
  const { fileId, status } = req.body;
  if (!fileId || !status) return res.status(400).json({ message: "File and status required" });

  const updated = await FileStatus.findOneAndUpdate({ fileId }, { status }, { upsert: true, new: true });
  res.json(updated);
};

// Get pending files
export const getPendingFiles = async (req, res) => {
  const data = await PendingFile.find();
  res.json(data);
};
