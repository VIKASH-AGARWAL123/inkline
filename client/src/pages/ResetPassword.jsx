import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { state } = useLocation()
  const resetToken = state?.resetToken || ''
  const navigate = useNavigate()
  const { login } = useAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!resetToken) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center font-serif text-muted">
        Reset session expired.{' '}
        <Link to="/forgot-password" className="text-accent hover:underline">
          Start over
        </Link>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    if (password !== confirm) {
      return setError('Passwords do not match.')
    }

    setSubmitting(true)
    try {
      const res = await api.post('/auth/reset-password', { resetToken, password })
      // Log the user in automatically with the token the server returns
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const strength = password.length === 0
    ? null
    : password.length < 6
    ? 'weak'
    : password.length < 10
    ? 'fair'
    : 'strong'

  const strengthColor = { weak: 'bg-red-500', fair: 'bg-yellow-400', strong: 'bg-green-500' }
  const strengthWidth = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-1">Set new password</h1>
      <p className="text-muted mb-8 font-serif">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 pr-10 bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength bar */}
          {strength && (
            <div className="mt-2">
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthColor[strength]} ${strengthWidth[strength]}`}
                />
              </div>
              <p className={`font-mono text-xs mt-1 capitalize ${
                strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-yellow-500' : 'text-green-600'
              }`}>
                {strength}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-1">
            Confirm password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent ${
              confirm && confirm !== password ? 'border-red-400' : 'border-border'
            }`}
          />
          {confirm && confirm !== password && (
            <p className="font-mono text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper font-mono text-sm py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </div>
  )
}
