// Vercel Serverless Function — POST /api/verify-razorpay-payment
// Verifies the Razorpay payment signature using HMAC-SHA256.
// The secret key never leaves the server.
//
// Required env var:
//   RAZORPAY_KEY_SECRET

const crypto = require('crypto');
const { applyCors } = require('./_cors');

module.exports = async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required payment fields.' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[verify-razorpay-payment] RAZORPAY_KEY_SECRET not set');
    return res.status(500).json({ error: 'Payment gateway not configured.' });
  }

  // Compare as UTF-8 strings — avoids ERR_INVALID_ARG_VALUE if razorpay_signature
  // is malformed and hex-decodes to a different byte length than expected.
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const expectedBuf = Buffer.from(expected);
  const actualBuf   = Buffer.from(razorpay_signature);

  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return res.status(400).json({ verified: false, error: 'Payment signature mismatch.' });
  }

  return res.status(200).json({ verified: true, paymentId: razorpay_payment_id });
};
