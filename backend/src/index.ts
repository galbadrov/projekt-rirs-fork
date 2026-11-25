import "dotenv/config";
import express from "express";
import path from "node:path";
import cors from "cors";
import { prisma } from "./db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import { requireAuth, requireRole,} from "./middleware/auth.middleware.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "FixDesk API is running",
  });
});

app.get("/api/db-health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(503).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.get(
  "/api/test/admin",
  requireAuth,
  requireRole("ADMIN"),
  (_req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

app.get(
  "/api/test/technician",
  requireAuth,
  requireRole("TECHNICIAN", "ADMIN"),
  (_req, res) => {
    res.json({ message: "Technician access granted" });
  }
);


if (process.env.FRONTEND_DIR) {
  const frontendDir = path.resolve(process.env.FRONTEND_DIR);
  app.use(express.static(frontendDir));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FixDesk API running on http://localhost:${PORT}`);
});
