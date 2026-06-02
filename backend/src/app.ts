import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import connectDB from "./config/db";
import env from "./config/env";
import swaggerSpec from "./config/swagger";
import logger from "./utils/logger";
import { errorMiddleware } from "./middlewares/error.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import cleaningRoutes from "./routes/cleaning.routes";
import cleaningSlotRoutes from "./routes/cleaningSlot.routes";
import cleaningBookingRoutes from "./routes/cleaningBooking.routes";
import modItemRoutes from "./routes/modItem.routes";
import repairSlotRoutes from "./routes/repairSlot.routes";
import repairBookingRoutes from "./routes/repairBooking.routes";
import carrierRequestRoutes from "./routes/carrierRequest.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "exp://localhost:19000",
  "http://localhost:8081",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : []),
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(mongoSanitize());

// ─── Rate Limiting ─────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// Auth endpoints rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later.",
  },
});

// ─── General Middleware ────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.http(message.trim()) },
  }),
);

// ─── Swagger Docs ──────────────────────────────────────────────────────
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

// ─── Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/cleaning-services", cleaningRoutes);
app.use("/api/cleaning-slots", cleaningSlotRoutes);
app.use("/api/cleaning-bookings", cleaningBookingRoutes);
app.use("/api/mod-items", modItemRoutes);
app.use("/api/repair-slots", repairSlotRoutes);
app.use("/api/repair-bookings", repairBookingRoutes);
app.use("/api/carrier-requests", carrierRequestRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── Health Check ──────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res
    .status(404)
    .json({ success: false, message: "Route not found", data: null });
});

// ─── Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ──────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`API Docs: http://localhost:${env.PORT}/api/docs`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
