const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user.
 * @param {Object} payload - Data to embed in the token
 * @param {string} payload.id - User's MongoDB _id
 * @param {string} payload.role - User's role
 * @param {string} [expiresIn] - Optional override; defaults to JWT_EXPIRE env var
 * @returns {string} Signed JWT string
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };