
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config/firebase');

// Create a checkout session for adding funds
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user data from Firebase
    const userSnapshot = await db.ref(`users/${userId}`).once('value');
    const user = userSnapshot.val();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Account Funds',
              description: 'Add funds to your trading account',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        amount: amount.toString(),
      },
    });
    
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle webhook events from Stripe
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Get user ID and amount from metadata
      const { userId, amount } = session.metadata;
      
      if (!userId || !amount) {
        throw new Error('Missing user ID or amount in session metadata');
      }
      
      // Update user's balance in Firebase
      const userSnapshot = await db.ref(`users/${userId}`).once('value');
      const user = userSnapshot.val();
      
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }
      
      const currentBalance = user.balance || 0;
      const newBalance = currentBalance + parseFloat(amount);
      
      await db.ref(`users/${userId}`).update({ balance: newBalance });
      
      // Create a record of the transaction
      await db.ref(`transactions/${userId}`).push({
        id: Date.now().toString(),
        userId: userId,
        type: 'deposit',
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        paymentIntentId: session.payment_intent,
      });
      
      console.log(`Successfully processed payment for user ${userId}: $${amount}`);
    } catch (error) {
      console.error('Error processing payment completion:', error);
      // Don't send error response here, as Stripe will retry if we do
    }
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
