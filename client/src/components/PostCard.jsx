import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/getImageUrl'

export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="border-b border-border py-6">
      <div className="flex items-center gap-2 font-mono text-xs text-muted mb-2 uppercase tracking-wide">
        <span>@{post.author?.username}</span>
        <span>·</span>
        <span>{date}</span>
      </div>
      <Link to={`/post/${post._id}`} className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-bold mb-2 hover:text-accent transition-colors">
            {post.title}
          </h2>
          <p className="font-serif text-ink/80 leading-relaxed line-clamp-3">
            {post.excerpt || post.content}
          </p>
        </div>
        {post.image && (
          <img
            src={getImageUrl(post.image)}
            alt=""
            className="w-24 h-24 object-cover rounded-md border border-border shrink-0"
          />
        )}
      </Link>
      <div className="flex items-center gap-4 mt-3 font-mono text-xs text-muted">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>
    </article>
  )
}
