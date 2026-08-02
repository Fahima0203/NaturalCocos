// Shared CORS handling for all /api/* serverless functions.
// Restricts cross-origin requests to known site origins instead of '*'.

const ALLOWED_ORIGINS = [
  'https://www.naturalcocos.com',
  'https://naturalcocos.com',
  'http://localhost:3000',
];

/**
 * Applies CORS headers and handles OPTIONS preflight.
 * Returns true if the caller should stop processing (preflight already answered).
 */
function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

module.exports = { applyCors, ALLOWED_ORIGINS };
