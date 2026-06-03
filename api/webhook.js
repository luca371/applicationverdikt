const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false }, // raw body necesar pentru Stripe
};

const getRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig     = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`Plata reusita — uid: ${session.metadata?.uid}, plan: ${session.metadata?.plan}`);
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    console.log(`Abonament anulat — customer: ${sub.customer}`);
  }

  res.json({ received: true });
};