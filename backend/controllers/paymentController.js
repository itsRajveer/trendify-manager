
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { db } = require("../config/firebase");

// Create a Stripe checkout session for adding funds
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.uid;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Add Funds to Account",
              description: `Add $${amount} to your trading account`,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/`,
      client_reference_id: userId, // Store userId to identify the user later
      metadata: {
        userId,
        amount,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// Handle webhook events from Stripe
exports.handleWebhook = async (req, res) => {
  const payload = req.rawBody;
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    try {
      // Add the fund amount to the user's balance
      await handleSuccessfulPayment(
        session.client_reference_id,
        session.metadata.amount
      );
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  }

  res.status(200).send({ received: true });
};

// Update user balance in Firebase
const handleSuccessfulPayment = async (userId, amount) => {
  console.log(`Processing payment for user ${userId}, amount: $${amount}`);
  
  try {
    // Get current user data
    const userRef = db.ref(`users/${userId}`);
    const userSnapshot = await userRef.once("value");
    const user = userSnapshot.val();
    
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    // Add the amount to the user's balance
    const newBalance = (user.balance || 0) + parseFloat(amount);
    
    // Update the user's balance in Firebase
    await userRef.update({ balance: newBalance });
    
    // Create a transaction record for this deposit
    const transaction = {
      id: Date.now().toString(),
      userId,
      type: "deposit",
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      description: "Added funds via Stripe",
    };
    
    // Save the transaction in Firebase
    await db.ref(`transactions/${userId}`).push(transaction);
    
    console.log(`Successfully updated balance for user ${userId} to $${newBalance}`);
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};
