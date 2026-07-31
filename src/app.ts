import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import helmet from "helmet";
import env from "./config/env";

import chapaRouter from "./routes/chapaRoute";
import adminRouter from "./routes/adminRoute";
import newsRouter from "./routes/newsRoute";
import contactRouter from "./routes/contactRoute";
import emergenciesRouter from "./routes/emergenciesRoute";
import beneficiaryStatsRouter from "./routes/beneficiaryStatsRoute";
import transparencyRouter from "./routes/transparencyRoute";

import { globalErrorHandler } from "./middleware/errorHandler";
import prisma from "./config/prisma";

dotenv.config();
env.validateEnv();

const app = express();
const swaggerDocument = YAML.load("./swagger.yaml");

app.disable("etag");
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://hibret-lebego.vercel.app",
  "https://ui-hl-ngo.vercel.app",
  "http://localhost:3000",
  "https://hl-ngo.vercel.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🛑 CORS Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "HL Organization API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

app.use("/api/v1/donation", chapaRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/emergencies", emergenciesRouter);
app.use("/api/v1/beneficiary-stats", beneficiaryStatsRouter);
app.use("/api/v1/transparency", transparencyRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Backend is running! Visit /api-docs for API documentation",
  });
});

app.get("/health", async (_req, res) => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB health check timed out")), 5000),
      ),
    ]);
    res.json({ status: "ok", database: "up", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({
      status: "error",
      database: "down",
      timestamp: new Date().toISOString(),
    });
  }
});

app.all("*", (req, res, _next) => {
  res
    .status(404)
    .json({ status: "fail", message: `Cannot find ${req.originalUrl}` });
});

// global error handling middleware
app.use(globalErrorHandler);

export default app;
