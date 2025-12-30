


import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import dotenv from "dotenv";


import adminRoutes from "./routes/admin.js";
import inwardRoutes from "./routes/inward.js";
import outwardRoutes from "./routes/outward.js";
import fileRoutes from "./routes/file.js";
import pendingRoutes from "./routes/pending.js";


import tapalReceivedRoutes from './routes/tapalReceivedRoutes.js';
import tapalDispatchedRoutes from './routes/tapalDispatchedRoutes.js';
import tapalPendingRoutes from './routes/tapalPendingRoutes.js';
import tapalSearchRoutes from './routes/tapalSearchRoutes.js';
import printTapalRoutes from './routes/printTapalRoutes.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/inward", inwardRoutes);
app.use("/api/outward", outwardRoutes);
app.use("/uploads", express.static("uploads")); // serve uploaded files



app.use("/api/file", fileRoutes);
app.use("/api", pendingRoutes);


app.use('/api/tapal/received', tapalReceivedRoutes);
app.use('/api/tapal', tapalDispatchedRoutes);
app.use('/api/tapal/pending', tapalPendingRoutes);
app.use('/api/tapal', tapalSearchRoutes);
app.use('/api/tapal', printTapalRoutes);



pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ PostgreSQL Error:", err));
  app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});