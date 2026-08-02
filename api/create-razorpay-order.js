// Vercel Serverless Function — POST /api/create-razorpay-order
// Creates a Razorpay order server-side so the secret key is never exposed
// to the browser.
//
// Required env vars (set in Vercel dashboard, NOT prefixed with REACT_APP_):
//   REACT_APP_RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

const Razorpay = require('razorpay');
const { applyCors } = require('./_cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { amount, currency = 'INR', receipt } = req.body || {};

  // Basic input validation — amount is in ₹ (frontend sends rupees, not paise)
  if (
    amount == null ||
    typeof amount !== 'number' ||
    amount <= 0 ||
    amount > 5_000_000  // ₹50 lakh upper guard
  ) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  const keyId     = process.env.REACT_APP_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[create-razorpay-order] Razorpay credentials missing from env');
    return res.status(500).json({ error: 'Payment gateway not configured.' });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // convert ₹ → paise (integer)
      currency: currency.toUpperCase(),
      receipt:  (receipt || `rcpt_${Date.now()}`).slice(0, 40), // Razorpay max 40 chars
    });

    return res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,   // paise
      currency: order.currency,
    });
  } catch (err) {
    console.error('[create-razorpay-order] Razorpay API error:', err);
    return res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
};
