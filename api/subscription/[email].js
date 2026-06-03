const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  essential: 'price_1Te9psDJ08s3VhJZKd4VSwp5',
  premium:   'price_1Te9qBDJ08s3VhJZhOdUTXFU',
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.query;

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) return res.json({ plan: 'free' });

    const customerId    = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status:   'active',
      limit:    1,
    });

    if (!subscriptions.data.length) return res.json({ plan: 'free' });

    const priceId = subscriptions.data[0].items.data[0].price.id;
    const plan    = Object.entries(PRICE_IDS).find(([, v]) => v === priceId)?.[0] || 'free';

    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};