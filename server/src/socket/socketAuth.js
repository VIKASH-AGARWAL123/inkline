import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) return next(new Error('Authentication required.'))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return next(new Error('User not found.'))

    socket.user = user
    next()
  } catch {
    next(new Error('Invalid or expired token.'))
  }
}
