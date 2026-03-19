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

import { globalErrorHandler } from "./middleware/errorHandler";

dotenv.config();
env.validateEnv();

const app = express();
const swaggerDocument = YAML.load("./swagger.yaml");

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: "10kb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

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
