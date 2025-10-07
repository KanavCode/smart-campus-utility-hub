import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import electiveRoutes from "./routes/electiveRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import allocationRoutes from "./routes/allocationRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/electives", electiveRoutes);
app.use("/api/allocation", allocationRoutes);

// Error handler
app.use(errorHandler);

// Connect to DB
sequelize.sync({ alter: true })
  .then(() => console.log("✅ PostgreSQL connected and models synced"))
  .catch((err) => console.error("❌ DB Connection Error:", err));


app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
