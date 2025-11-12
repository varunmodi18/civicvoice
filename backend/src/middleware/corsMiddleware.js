
const cors = require('cors');

const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const corsMiddleware = cors({
  origin: (origin, cb) => {
    const allowed = parseOrigins(process.env.CLIENT_ORIGINS || '');
    if (!origin) return cb(null, true); // e.g., curl, Postman
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

module.exports = corsMiddleware;
