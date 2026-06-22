import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getImageUrl } from '../utils/getImageUrl'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function loadPost() {
    setLoading(true)
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .finally(() => setLoading(false))
  }

  async function handleLike() {
    await api.post(`/posts/${id}/like`)
    loadPost()
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    await api.post(`/posts/${id}/comments`, { text: comment })
    setComment('')
    loadPost()
  }

  if (loading) return <p className="text-center text-muted py-16 font-serif">Loading…</p>
  if (!post) return <p className="text-center text-muted py-16 font-serif">Post not found.</p>

  const liked = user && post.likes?.includes(user._id)

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <div className="font-mono text-xs text-muted uppercase tracking-wide mb-2">
        @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}
      </div>
      <h1 className="font-display text-3xl font-bold mb-6">{post.title}</h1>
      {post.image && (
        <img
          src={getImageUrl(post.image)}
          alt=""
          className="w-full max-h-96 object-cover rounded-md border border-border mb-8"
        />
      )}
      <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap mb-8">{post.content}</div>

      <button
        onClick={handleLike}
        disabled={!user}
        className={`font-mono text-sm px-3 py-1.5 rounded-md border transition-colors ${
          liked ? 'bg-accent text-paper border-accent' : 'border-border hover:border-accent'
        }`}
      >
        {liked ? 'Liked' : 'Like'} · {post.likes?.length || 0}
      </button>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="font-display font-bold mb-4">Comments ({post.comments?.length || 0})</h2>
        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-6">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="font-mono text-sm bg-ink text-paper px-4 rounded-md hover:bg-accent transition-colors"
            >
              Post
            </button>
          </form>
        )}
        <div className="space-y-4">
          {post.comments?.map((c) => (
            <div key={c._id} className="border-b border-border pb-3">
              <div className="font-mono text-xs text-muted uppercase tracking-wide mb-1">
                @{c.author?.username}
              </div>
              <p className="font-serif">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
