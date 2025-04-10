
const express = require("express");
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a checkout session for adding funds
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

// Handle webhook events from Stripe
router.post(
  "/webhook",
  express.raw({ type: 'application/json' }),
  handleWebhook
);

module.exports = router;
