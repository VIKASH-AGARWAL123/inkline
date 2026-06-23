import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },       // stored as bcrypt hash
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
})

// Hash the OTP before saving
otpSchema.pre('save', async function (next) {
  if (!this.isModified('code')) return next()
  const salt = await bcrypt.genSalt(10)
  this.code = await bcrypt.hash(this.code, salt)
  next()
})

otpSchema.methods.verifyCode = function (candidate) {
  return bcrypt.compare(candidate, this.code)
}

// Auto-delete expired docs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OTP', otpSchema)
