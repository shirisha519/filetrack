import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import adminRoutes from "./routes/admin.js";
import inwardRoutes from "./routes/inward.js";
import fileRoutes from "./routes/file.js";
import pendingRoutes from "./routes/pending.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/inward", inwardRoutes);
app.use("/api/files", fileRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));
  app.post("/api/inward/search", async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const results = await Inward.find({
      date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error searching inward records" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
