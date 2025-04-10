
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const portfolioRoutes = require("./routes/portfolioRoutes");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Handle raw body for Stripe webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      req.rawBody = rawBody;
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", stockRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
