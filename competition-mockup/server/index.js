const express = require("express");
const cors = require("cors");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Competition mockup API is running" });
});

app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle all other routes - serve SPA
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("============================================================");
  console.log("  Competition Mockup Server Running");
  console.log("============================================================");
  console.log("  Local:            http://localhost:" + PORT);
  console.log("  Network:          http://103.175.218.159:" + PORT);
  console.log("  API Endpoints:    http://103.175.218.159:" + PORT + "/api");
  console.log("============================================================");
});

process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
});
