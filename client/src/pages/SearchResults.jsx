import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api'
import PostCard from '../components/PostCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) {
      setPosts([])
      setUsers([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      api.get('/posts/search', { params: { q } }),
      api.get('/users/search', { params: { q } }),
    ])
      .then(([postsRes, usersRes]) => {
        setPosts(postsRes.data)
        setUsers(usersRes.data)
      })
      .finally(() => setLoading(false))
  }, [q])

  if (loading) return <p className="text-center text-muted py-16 font-serif">Searching…</p>

  const hasResults = posts.length > 0 || users.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-1">Search</h1>
      <p className="font-mono text-sm text-muted mb-6">"{q}"</p>

      {!hasResults && (
        <p className="text-muted font-serif">No posts or people match that search.</p>
      )}

      {users.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-bold mb-3">People</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="flex items-center justify-between border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
              >
                <div>
                  <p className="font-display font-bold">{u.name}</p>
                  <p className="font-mono text-xs text-muted">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="font-display font-bold mb-3">Posts</h2>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </section>
      )}
    </div>
  )
}
