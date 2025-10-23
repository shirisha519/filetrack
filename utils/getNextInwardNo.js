import Counter from "../models/Counter.js";

export const getNextInwardNo = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "inwardNo" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq.toString().padStart(3, "0");
  return `INW-${seq}`;
};
