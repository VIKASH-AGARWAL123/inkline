import { useState, useEffect } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'

export default function Bookmarks() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/posts/bookmarks')
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p._id !== id))
  }

  if (loading) return <p className="text-center text-muted py-16 font-serif">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Saved posts</h1>
      {posts.length === 0 ? (
        <p className="text-muted font-serif">You haven't saved any posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onDelete={handleDelete} />)
      )}
    </div>
  )
}
