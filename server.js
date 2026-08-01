/**
 * server.js — Local development API server
 *
 * WHY THIS EXISTS
 * ---------------
 * `npm start` launches CRA's Webpack dev server, which has no knowledge of
 * the /api/ Vercel serverless functions. Any fetch('/api/...') call falls
 * through to CRA's catch-all and returns the React index.html, causing:
 *   SyntaxError: Unexpected token '<', "<!DOCTYPE..." is not valid JSON
 *
 * This Express server mirrors every endpoint in /api/ so local development
 * works identically to the Vercel production deployment.
 *
 * CRA's "proxy" setting in package.json transparently forwards all /api/*
 * requests from the React dev server (:3000) to this server (:3001) — no
 * CORS headers or URL changes needed in the frontend code.
 *
 * HOW TO RUN
 * ----------
 *   npm run dev          ← starts both servers together (recommended)
 *   -- or --
 *   Terminal 1: npm start
 *   Terminal 2: node server.js
 *
 * ENV VARS
 * --------
 * Loaded automatically from .env.local (same file CRA uses for REACT_APP_*).
 * Required keys:
 *   REACT_APP_RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 */

const express  = require('express');
const Razorpay = require('razorpay');
const crypto   = require('crypto');

// Load .env.local — picks up REACT_APP_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, etc.
require('dotenv').config({ path: '.env.local' });

const app  = express();
const PORT = 3001;

app.use(express.json());

// ── POST /api/create-razorpay-order ──────────────────────────────────────────
// Mirrors: api/create-razorpay-order.js (Vercel serverless function)
app.post('/api/create-razorpay-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body || {};

  if (amount == null || typeof amount !== 'number' || amount <= 0 || amount > 5_000_000) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  const keyId     = process.env.REACT_APP_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      '\n[server.js] ✗ REACT_APP_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing.\n' +
      '  Add them to your .env.local file:\n' +
      '  REACT_APP_RAZORPAY_KEY_ID=rzp_test_...\n' +
      '  RAZORPAY_KEY_SECRET=your_secret\n'
    );
    return res.status(500).json({
      error: 'Razorpay credentials not set. Add REACT_APP_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local',
    });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // ₹ → paise
      currency: currency.toUpperCase(),
      receipt:  (receipt || `rcpt_${Date.now()}`).slice(0, 40),
    });
    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('[server.js] Razorpay order creation failed:', err.message);
    return res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
});

// ── POST /api/verify-razorpay-payment ────────────────────────────────────────
// Mirrors: api/verify-razorpay-payment.js (Vercel serverless function)
app.post('/api/verify-razorpay-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required payment fields.' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Payment gateway not configured.' });
  }

  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

  // Compare as UTF-8 strings — avoids hex-decode length mismatch in timingSafeEqual
  const expectedBuf = Buffer.from(expected);
  const actualBuf   = Buffer.from(razorpay_signature);

  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return res.status(400).json({ verified: false, error: 'Payment signature mismatch.' });
  }

  return res.json({ verified: true, paymentId: razorpay_payment_id });
});

// ── POST /api/send-order-email ────────────────────────────────────────────────
// Mirrors: api/send-order-email.js (Vercel serverless function)
const sendOrderEmailHandler = require('./api/send-order-email');
app.post('/api/send-order-email', sendOrderEmailHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[dev] ✓ API server  → http://localhost:${PORT}`);
  console.log('[dev] ✓ CRA proxy forwards /api/* from :3000 to here\n');
});
