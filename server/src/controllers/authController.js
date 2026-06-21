import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { generateUsername } from '../utils/generateUsername.js'

export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists.' })
    }

    const username = await generateUsername(name)
    const user = await User.create({ name, email, password, username })
    const token = generateToken(user._id)

    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Could not create your account.', error: err.message })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email?.toLowerCase() })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Could not sign in.', error: err.message })
  }
}

export async function getMe(req, res) {
  res.json(req.user)
}
