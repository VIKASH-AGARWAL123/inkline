import { useState, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function VerifyOTP() {
  const { state } = useLocation()
  const email = state?.email || ''
  const navigate = useNavigate()

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const inputRefs = useRef([])

  function handleChange(index, value) {
    // Accept only a single digit
    const digit = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = digit
    setDigits(updated)
    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const updated = [...digits]
    pasted.split('').forEach((d, i) => { updated[i] = d })
    setDigits(updated)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/auth/verify-otp', { email, code })
      navigate('/reset-password', { state: { resetToken: res.data.resetToken } })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setResent(true)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setTimeout(() => setResent(false), 5000)
    } catch {
      setError('Could not resend code. Try again.')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center font-serif text-muted">
        No email found.{' '}
        <Link to="/forgot-password" className="text-accent hover:underline">
          Start over
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-1">Check your email</h1>
      <p className="text-muted mb-8 font-serif">
        We sent a 6-digit code to <span className="text-ink font-mono">{email}</span>. It expires in 10 minutes.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center font-mono text-xl font-bold border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
          ))}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {resent && <p className="text-sm text-green-600 font-mono">Code resent ✓</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper font-mono text-sm py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          {submitting ? 'Verifying…' : 'Verify code'}
        </button>
      </form>
      <p className="text-sm text-muted mt-6 font-serif">
        Didn't get it?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-accent hover:underline disabled:opacity-50"
        >
          {resending ? 'Resending…' : 'Resend code'}
        </button>
      </p>
    </div>
  )
}
