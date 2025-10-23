import Inward from "../models/Inward.js";
import { getNextInwardNo } from "../utils/getNextInwardNo.js";

export const getNextInwardNumber = async (req, res) => {
  try {
    const inwardNo = await getNextInwardNo();
    res.json({ inwardNo });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inward no" });
  }
};

export const createInward = async (req, res) => {
  try {
    const inwardNo = await getNextInwardNo();
    const newInward = await Inward.create({ inwardNo, ...req.body });
    res.status(201).json(newInward);
  } catch (error) {
    res.status(500).json({ message: "Error creating inward" });
  }
};

export const searchInward = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const results = await Inward.find({
      date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    }).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};
