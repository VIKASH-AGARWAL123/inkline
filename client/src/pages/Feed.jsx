import { useState, useEffect } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setError('Could not load the feed right now.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-muted py-16 font-serif">Loading posts…</p>
  if (error) return <p className="text-center text-red-600 py-16">{error}</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Latest</h1>
      {posts.length === 0 ? (
        <p className="text-muted font-serif">No posts yet. Be the first to write something.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  )
}
