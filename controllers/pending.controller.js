


import Pending from "../models/PendingFile.js";

export const getPendingFiles = async (req, res) => {
  const pending = await Pending.find();
  res.json(pending);
};
