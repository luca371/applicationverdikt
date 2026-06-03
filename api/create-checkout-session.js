const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  essential: 'price_1Te9psDJ08s3VhJZKd4VSwp5',
  premium:   'price_1Te9qBDJ08s3VhJZhOdUTXFU',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, uid, email } = req.body;

  if (!PRICE_IDS[plan]) return res.status(400).json({ error: 'Plan invalid.' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      customer_email:       email,
      line_items:           [{ price: PRICE_IDS[plan], quantity: 1 }],
      metadata:             { uid, plan },
      success_url: `${process.env.CLIENT_URL}/start?payment=success&plan=${plan}`,
      cancel_url:  `${process.env.CLIENT_URL}/start?payment=cancelled`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};