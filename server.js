require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));

// Webhook — raw body INAINTE de express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`Plata reusita — uid: ${session.metadata?.uid}, plan: ${session.metadata?.plan}`);
    // Planul se salveaza in Firestore direct din client dupa redirect
    // Webhook-ul e backup pentru edge cases
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    console.log(`Abonament anulat — customer: ${sub.customer}`);
    // TODO: reseteaza planul la 'free' in Firestore daca vrei
  }

  res.json({ received: true });
});

app.use(express.json());

// ─── PRICE IDS ────────────────────────────────────────────────────────────────
const PRICE_IDS = {
  essential: 'price_1Te9psDJ08s3VhJZKd4VSwp5',
  premium:   'price_1Te9qBDJ08s3VhJZhOdUTXFU',
};

// ─── CREATE CHECKOUT SESSION ──────────────────────────────────────────────────
app.post('/create-checkout-session', async (req, res) => {
  const { plan, uid, email } = req.body;

  if (!PRICE_IDS[plan]) {
    return res.status(400).json({ error: 'Plan invalid.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      customer_email:       email,
      line_items:           [{ price: PRICE_IDS[plan], quantity: 1 }],
      metadata:             { uid, plan },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/start?payment=success&plan=${plan}`,
      cancel_url:  `${process.env.CLIENT_URL || 'http://localhost:3000'}/start?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Verdikt server running on http://localhost:${PORT}`));