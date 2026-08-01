// Vercel Serverless Function — POST /api/send-order-email
// Sends two emails on every confirmed order:
//   1. Professional order-confirmation to the customer
//   2. New-order notification to the business inbox
// And one alert email when a payment issue is reported.
//
// Required env vars:
//   GMAIL_USER   — naturalcocos786@gmail.com
//   GMAIL_PASS   — Gmail App Password (16-char, no spaces)

const nodemailer = require('nodemailer');

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function addressBlock(a) {
  const lines = [a.fullName];
  if (a.company) lines.push(a.company);
  lines.push(a.address1);
  if (a.address2) lines.push(a.address2);
  lines.push(`${a.city} – ${a.postalCode}`);
  lines.push(`${a.state}, ${a.country}`);
  if (a.phone) lines.push(`📞 ${a.phone}`);
  return lines.join('<br>');
}

function itemsTable(items) {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5e9;color:#333;">${it.section} — ${it.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5e9;text-align:center;color:#555;">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5e9;text-align:right;color:#333;">${fmt(it.priceValue)}/unit</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5e9;text-align:right;font-weight:600;color:#00695c;">${fmt(it.itemSubtotal)}</td>
      </tr>`
    )
    .join('');

  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border-collapse:collapse;font-size:0.92rem;margin-top:8px;">
    <thead>
      <tr style="background:#e8f5e9;">
        <th style="padding:10px 12px;text-align:left;color:#00695c;font-weight:700;">Product</th>
        <th style="padding:10px 12px;text-align:center;color:#00695c;font-weight:700;">Qty</th>
        <th style="padding:10px 12px;text-align:right;color:#00695c;font-weight:700;">Unit Price</th>
        <th style="padding:10px 12px;text-align:right;color:#00695c;font-weight:700;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function totalsBlock(subtotal, shippingCost, totalAmount) {
  const shippingLabel = shippingCost === 0
    ? '<span style="color:#43a047;">FREE</span>'
    : fmt(shippingCost);
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
         style="border-collapse:collapse;font-size:0.93rem;margin-top:4px;">
    <tr>
      <td style="padding:6px 12px;color:#555;">Subtotal</td>
      <td style="padding:6px 12px;text-align:right;color:#333;">${fmt(subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:6px 12px;color:#555;">Shipping</td>
      <td style="padding:6px 12px;text-align:right;">${shippingLabel}</td>
    </tr>
    <tr style="background:#e8f5e9;">
      <td style="padding:10px 12px;font-weight:700;font-size:1rem;color:#00695c;">Grand Total</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:1rem;color:#00695c;">${fmt(totalAmount)}</td>
    </tr>
  </table>`;
}

const HEADER = `
<div style="background:linear-gradient(90deg,#00695c 0%,#43a047 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
  <h1 style="margin:0;color:#fff;font-size:1.6rem;font-family:Arial,sans-serif;letter-spacing:0.5px;">
    🌿 Natural Cocos
  </h1>
  <p style="margin:4px 0 0;color:#c8e6c9;font-size:0.88rem;">Premium Coir &amp; Cocopeat Products</p>
</div>`;

const FOOTER = `
<div style="background:#f5faf5;border-top:1px solid #e8f5e9;padding:20px 32px;border-radius:0 0 12px 12px;
            font-size:0.82rem;color:#777;font-family:Arial,sans-serif;text-align:center;">
  Natural Cocos &nbsp;|&nbsp; naturalcocos786@gmail.com
  &nbsp;|&nbsp; For queries reply to this email or WhatsApp us.
  <br><br>
  <em>This is an automated email. Please do not reply directly to this address.</em>
</div>`;

// ── Email builders ─────────────────────────────────────────────────────────────

function buildCustomerEmail({ orderId, userEmail, items, shippingAddress,
                               subtotal, shippingCost, totalAmount,
                               razorpayOrderId, razorpayPaymentId, createdAt }) {
  const dateStr = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:32px 16px;background:#f0f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;
              box-shadow:0 4px 24px rgba(0,105,92,0.08);overflow:hidden;">
    ${HEADER}

    <div style="padding:32px;">

      <h2 style="color:#00695c;margin:0 0 4px;font-size:1.35rem;">Order Confirmed ✅</h2>
      <p style="color:#555;margin:0 0 24px;font-size:0.95rem;">
        Thank you for your order, <strong>${shippingAddress.fullName}</strong>!
        We have received it and will process it shortly.
      </p>

      <!-- Order meta -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#f5faf5;border-radius:8px;padding:16px;
                    border:1px solid #e8f5e9;margin-bottom:24px;font-size:0.9rem;">
        <tr>
          <td style="padding:5px 12px;color:#555;">Order Number</td>
          <td style="padding:5px 12px;color:#00695c;font-weight:700;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Order Date</td>
          <td style="padding:5px 12px;color:#333;">${dateStr} IST</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Payment Status</td>
          <td style="padding:5px 12px;color:#43a047;font-weight:600;">Paid ✔</td>
        </tr>
        ${razorpayPaymentId ? `
        <tr>
          <td style="padding:5px 12px;color:#555;">Payment ID</td>
          <td style="padding:5px 12px;color:#333;font-size:0.82rem;">${razorpayPaymentId}</td>
        </tr>` : ''}
      </table>

      <!-- Items -->
      <h3 style="color:#00695c;margin:0 0 8px;font-size:1rem;">Order Items</h3>
      ${itemsTable(items)}

      <!-- Totals -->
      <div style="margin-top:16px;">${totalsBlock(subtotal, shippingCost, totalAmount)}</div>

      <!-- Shipping address -->
      <h3 style="color:#00695c;margin:28px 0 8px;font-size:1rem;">Shipping Address</h3>
      <div style="background:#f5faf5;border-radius:8px;padding:16px 20px;
                  border:1px solid #e8f5e9;font-size:0.93rem;color:#444;line-height:1.7;">
        ${addressBlock(shippingAddress)}
      </div>

      <!-- What's next -->
      <div style="background:#e8f5e9;border-radius:8px;padding:16px 20px;margin-top:24px;
                  font-size:0.9rem;color:#2e7d32;line-height:1.6;">
        <strong>What happens next?</strong><br>
        We have received your details. Our team will review the order and send
        processing, dispatch, and delivery updates.
        Keep your order number <strong>#${orderId}</strong> handy for reference.
      </div>

      <p style="margin-top:24px;color:#555;font-size:0.9rem;">
        Questions? Reply to this email or reach us at
        <a href="mailto:naturalcocos786@gmail.com" style="color:#00695c;">naturalcocos786@gmail.com</a>.
      </p>

    </div>
    ${FOOTER}
  </div>
</body>
</html>`;

  return {
    to:      userEmail,
    subject: `Order Confirmed #${orderId} — Natural Cocos`,
    html,
  };
}

function buildBusinessEmail({ orderId, userEmail, items, shippingAddress,
                               subtotal, shippingCost, totalAmount,
                               razorpayOrderId, razorpayPaymentId, createdAt }) {
  const dateStr = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#f0f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;
              box-shadow:0 4px 24px rgba(0,105,92,0.08);overflow:hidden;">
    ${HEADER}

    <div style="padding:32px;">

      <h2 style="color:#00695c;margin:0 0 4px;font-size:1.35rem;">🛒 New Order Received</h2>
      <p style="color:#555;margin:0 0 24px;font-size:0.95rem;">
        A new order has been placed and payment confirmed.
      </p>

      <!-- Order meta -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#f5faf5;border-radius:8px;padding:16px;
                    border:1px solid #e8f5e9;margin-bottom:24px;font-size:0.9rem;">
        <tr>
          <td style="padding:5px 12px;color:#555;">Order ID</td>
          <td style="padding:5px 12px;color:#00695c;font-weight:700;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Date &amp; Time</td>
          <td style="padding:5px 12px;color:#333;">${dateStr} IST</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Customer Email</td>
          <td style="padding:5px 12px;color:#333;">${userEmail}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Payment Status</td>
          <td style="padding:5px 12px;color:#43a047;font-weight:600;">✔ Paid</td>
        </tr>
        ${razorpayOrderId ? `
        <tr>
          <td style="padding:5px 12px;color:#555;">Razorpay Order</td>
          <td style="padding:5px 12px;color:#333;font-size:0.82rem;">${razorpayOrderId}</td>
        </tr>` : ''}
        ${razorpayPaymentId ? `
        <tr>
          <td style="padding:5px 12px;color:#555;">Razorpay Payment</td>
          <td style="padding:5px 12px;color:#333;font-size:0.82rem;">${razorpayPaymentId}</td>
        </tr>` : ''}
      </table>

      <!-- Items -->
      <h3 style="color:#00695c;margin:0 0 8px;font-size:1rem;">Items Ordered</h3>
      ${itemsTable(items)}

      <!-- Totals -->
      <div style="margin-top:16px;">${totalsBlock(subtotal, shippingCost, totalAmount)}</div>

      <!-- Shipping address -->
      <h3 style="color:#00695c;margin:28px 0 8px;font-size:1rem;">Ship To</h3>
      <div style="background:#f5faf5;border-radius:8px;padding:16px 20px;
                  border:1px solid #e8f5e9;font-size:0.93rem;color:#444;line-height:1.7;">
        ${addressBlock(shippingAddress)}
      </div>

    </div>
    ${FOOTER}
  </div>
</body>
</html>`;

  return {
    to:      process.env.GMAIL_USER,
    subject: `New Order #${orderId} — ${fmt(totalAmount)} | ${shippingAddress.fullName}`,
    html,
  };
}

function buildPaymentAlertEmail({ orderId, userEmail, shippingAddress,
                                   totalAmount, errorDescription,
                                   razorpayOrderId, razorpayPaymentId }) {
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:32px 16px;background:#fff3e0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;
              box-shadow:0 4px 24px rgba(230,81,0,0.1);overflow:hidden;">
    <div style="background:linear-gradient(90deg,#e65100 0%,#ef6c00 100%);padding:28px 32px;
                border-radius:12px 12px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:1.5rem;font-family:Arial,sans-serif;">
        ⚠️ Payment Issue — Natural Cocos
      </h1>
    </div>

    <div style="padding:32px;">
      <h2 style="color:#e65100;margin:0 0 16px;font-size:1.2rem;">Payment Pending / Failed</h2>
      <p style="color:#555;font-size:0.95rem;margin:0 0 24px;">
        A payment issue was detected for the order below. Please follow up with the customer.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#fff8f0;border-radius:8px;padding:16px;
                    border:1px solid #ffe0b2;margin-bottom:24px;font-size:0.9rem;">
        <tr>
          <td style="padding:5px 12px;color:#555;">Order ID</td>
          <td style="padding:5px 12px;color:#e65100;font-weight:700;">${orderId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Date &amp; Time</td>
          <td style="padding:5px 12px;color:#333;">${dateStr} IST</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Customer</td>
          <td style="padding:5px 12px;color:#333;">${shippingAddress?.fullName || '—'}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Customer Email</td>
          <td style="padding:5px 12px;color:#333;">${userEmail}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Amount</td>
          <td style="padding:5px 12px;font-weight:600;color:#333;">${fmt(totalAmount)}</td>
        </tr>
        <tr>
          <td style="padding:5px 12px;color:#555;">Payment Status</td>
          <td style="padding:5px 12px;color:#e53935;font-weight:600;">⚠ Pending / Failed</td>
        </tr>
        ${razorpayOrderId ? `
        <tr>
          <td style="padding:5px 12px;color:#555;">Razorpay Order</td>
          <td style="padding:5px 12px;color:#333;font-size:0.82rem;">${razorpayOrderId}</td>
        </tr>` : ''}
        ${razorpayPaymentId ? `
        <tr>
          <td style="padding:5px 12px;color:#555;">Razorpay Payment</td>
          <td style="padding:5px 12px;color:#333;font-size:0.82rem;">${razorpayPaymentId}</td>
        </tr>` : ''}
      </table>

      ${errorDescription ? `
      <div style="background:#fdecea;border-left:4px solid #e53935;border-radius:4px;
                  padding:14px 18px;font-size:0.9rem;color:#c62828;margin-bottom:20px;">
        <strong>Error Detail:</strong> ${errorDescription}
      </div>` : ''}

      <p style="color:#555;font-size:0.9rem;">
        Please check the Razorpay dashboard and contact the customer at
        <a href="mailto:${userEmail}" style="color:#e65100;">${userEmail}</a>
        ${shippingAddress?.phone ? `or call <strong>${shippingAddress.phone}</strong>` : ''}.
      </p>
    </div>

    <div style="background:#fff8f0;border-top:1px solid #ffe0b2;padding:20px 32px;
                border-radius:0 0 12px 12px;font-size:0.82rem;color:#888;text-align:center;">
      Natural Cocos — automated payment alert
    </div>
  </div>
</body>
</html>`;

  return {
    to:      process.env.GMAIL_USER,
    subject: `⚠️ Payment Issue — Order ${orderId || 'Unknown'} | ${userEmail}`,
    html,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.error('[send-order-email] GMAIL_USER or GMAIL_PASS missing from env');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const { type, ...payload } = req.body || {};

  // type: 'order_confirmed' | 'payment_failed'
  if (!type) return res.status(400).json({ error: 'Missing email type.' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const base = {
    from: `"Natural Cocos" <${gmailUser}>`,
  };

  try {
    if (type === 'order_confirmed') {
      const customerMail = buildCustomerEmail(payload);
      const businessMail = buildBusinessEmail(payload);

      await Promise.all([
        transporter.sendMail({ ...base, ...customerMail }),
        transporter.sendMail({ ...base, ...businessMail }),
      ]);

      return res.status(200).json({ sent: true });

    } else if (type === 'payment_failed') {
      const alertMail = buildPaymentAlertEmail(payload);
      await transporter.sendMail({ ...base, ...alertMail });
      return res.status(200).json({ sent: true });

    } else {
      return res.status(400).json({ error: `Unknown email type: ${type}` });
    }
  } catch (err) {
    console.error('[send-order-email] Send error:', err.message);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
};
