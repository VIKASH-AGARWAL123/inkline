const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function getImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SERVER_ORIGIN}${path}`
}
