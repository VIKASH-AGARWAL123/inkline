import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'

export default function SuggestionsSidebar() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [followed, setFollowed] = useState({})

  useEffect(() => {
    if (!user) return
    api.get('/users/suggestions')
      .then((res) => setSuggestions(res.data))
      .catch(() => {})
  }, [user])

  async function handleFollow(id) {
    // Optimistic toggle
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }))
    try {
      await api.post(`/users/${id}/follow`)
    } catch {
      setFollowed((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }

  if (!user || suggestions.length === 0) return null

  return (
    <aside className="w-72 shrink-0 hidden lg:block">
      <div className="sticky top-24">
        <h2 className="font-display font-bold text-sm mb-3 text-muted uppercase tracking-wide">
          Who to follow
        </h2>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s._id} className="flex items-center gap-3">
              <Link to={`/profile/${s._id}`}>
                <Avatar user={s} size="md" showOnline />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${s._id}`}
                  className="font-display font-bold text-sm hover:text-accent transition-colors block truncate">
                  {s.name}
                </Link>
                <p className="font-mono text-xs text-muted truncate">@{s.username}</p>
                <p className="font-mono text-xs text-muted">
                  {s.followers?.length || 0} followers
                </p>
              </div>
              <button
                onClick={() => handleFollow(s._id)}
                className={`font-mono text-xs px-3 py-1.5 rounded-full border shrink-0 transition-colors ${
                  followed[s._id]
                    ? 'border-border text-muted'
                    : 'border-ink bg-ink text-paper hover:bg-accent hover:border-accent'
                }`}
              >
                {followed[s._id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        {/* Online now section */}
        <OnlineNow />
      </div>
    </aside>
  )
}

function OnlineNow() {
  // Shown inline — uses the online context indirectly via Avatar's showOnline
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h2 className="font-display font-bold text-sm mb-1 text-muted uppercase tracking-wide">
        Online now
      </h2>
      <p className="font-mono text-xs text-muted">
        Green dots show who's currently active.
      </p>
    </div>
  )
}
