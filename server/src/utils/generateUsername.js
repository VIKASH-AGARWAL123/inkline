import User from '../models/User.js'

export async function generateUsername(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'user'
  let username = base
  let suffix = 0

  // eslint-disable-next-line no-await-in-loop
  while (await User.exists({ username })) {
    suffix += 1
    username = `${base}${suffix}`
  }

  return username
}
