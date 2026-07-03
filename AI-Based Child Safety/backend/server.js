require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Connect Database
connectDB();

const app = express();

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Security
app.use(helmet());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use("/api", limiter);

// Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/children", require("./routes/children"));
app.use("/api/parents", require("./routes/parents"));
app.use("/api/adoptions", require("./routes/adoptions"));
app.use("/api/risk-assessment", require("./routes/riskAssessment"));
app.use("/api/health-analysis", require("./routes/healthAnalysis"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/investigations", require("./routes/investigationReports"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI-Based Child Safety & Post-Adoption Monitoring System API",
    version: "1.0.0",
  });
});

// Production
if (process.env.NODE_ENV === "production") {
  const frontendBuildPath = path.join(
    __dirname,
    "..",
    "frontend",
    "build"
  );

  app.use(express.static(frontendBuildPath));

  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

// Error Handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the old backend process or set a different PORT in .env.`);
    process.exit(1);
  }

  throw err;
});

process.on("unhandledRejection", (err) => {
  console.error(err);
  server.close(() => process.exit(1));
});

module.exports = app;
