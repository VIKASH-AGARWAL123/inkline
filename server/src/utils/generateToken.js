import jwt from 'jsonwebtoken'

export function generateToken(userId, expiresIn = '30d') {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn })
}
