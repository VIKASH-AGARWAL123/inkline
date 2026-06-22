import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'
import PostCard from '../components/PostCard'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const sentinelRef = useRef(null)

  useEffect(() => {
    api
      .get('/posts', { params: { page: 1 } })
      .then((res) => {
        setPosts(res.data.posts)
        setHasMore(res.data.hasMore)
        setPage(1)
      })
      .catch(() => setError('Could not load the feed right now.'))
      .finally(() => setLoading(false))
  }, [])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    api
      .get('/posts', { params: { page: nextPage } })
      .then((res) => {
        setPosts((prev) => [...prev, ...res.data.posts])
        setHasMore(res.data.hasMore)
        setPage(nextPage)
      })
      .finally(() => setLoadingMore(false))
  }, [page, hasMore, loadingMore])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore])

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
      <div ref={sentinelRef} />
      {loadingMore && <p className="text-center text-muted py-6 font-mono text-sm">Loading more…</p>}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted py-6 font-mono text-xs uppercase tracking-wide">
          You've reached the end
        </p>
      )}
    </div>
  )
}
