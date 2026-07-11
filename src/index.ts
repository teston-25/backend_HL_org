import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config();
env.validateEnv();

const app = express();
const swaggerDocument = YAML.load("./swagger.yaml");

// 1. DISABLE EXPRESS ETags (Prevents automatic 304 revalidations globally)
app.disable("etag");

app.use(helmet());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://hibret-lebego.vercel.app",
  "http://localhost:3000",
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

// 2. CACHE-BUSTING MIDDLEWARE (Forces fresh responses from CDNs & Browsers)
const disableCaching = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

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

// Apply the cache-disabling middleware to all API version 1 routers
app.use("/api/v1", disableCaching);

// Your API Routes are now completely protected against caching
app.use("/api/v1/donation", chapaRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/emergencies", emergenciesRouter);
app.use("/api/v1/beneficiary-stats", beneficiaryStatsRouter);
app.use("/api/v1/transparency", transparencyRouter);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.json({
    message: "✅ Backend is running! Visit /api-docs for API documentation",
  });
});

// catch-all for undefined routes
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ status: "fail", message: `Cannot find ${req.originalUrl}` });
});

// global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`,
  );
});
