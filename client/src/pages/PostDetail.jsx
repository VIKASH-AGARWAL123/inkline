import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/getImageUrl";
import { getTopic } from "../utils/topics";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived optimistic state
  const [likes, setLikes] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${id}`)
      .then((res) => {
        const p = res.data;
        setPost(p);
        setLikes(p.likes || []);
        setBookmarked(p.bookmarks?.includes(user?._id) || false);
        setBookmarkCount(p.bookmarks?.length || 0);
        setComments(p.comments || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Like (optimistic) ──────────────────────────────────────
  async function handleLike() {
    if (!user) return;
    const alreadyLiked = likes.includes(user._id);
    setLikes((prev) =>
      alreadyLiked ? prev.filter((x) => x !== user._id) : [...prev, user._id],
    );
    try {
      await api.post(`/posts/${id}/like`);
    } catch {
      setLikes((prev) =>
        alreadyLiked ? [...prev, user._id] : prev.filter((x) => x !== user._id),
      );
    }
  }

  // ── Bookmark (optimistic) ──────────────────────────────────
  async function handleBookmark() {
    if (!user) return;
    const was = bookmarked;
    setBookmarked(!was);
    setBookmarkCount((c) => (was ? c - 1 : c + 1));
    try {
      const res = await api.post(`/posts/${id}/bookmark`);
      setBookmarked(res.data.bookmarked);
      setBookmarkCount(res.data.count);
    } catch {
      setBookmarked(was);
      setBookmarkCount((c) => (was ? c + 1 : c - 1));
    }
  }

  // ── Delete ─────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${id}`);
    navigate("/");
  }

  // ── Comment (optimistic) ───────────────────────────────────
  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    // Immediately show the comment
    const optimistic = {
      _id: `temp-${Date.now()}`,
      text: commentText,
      author: { _id: user._id, username: user.username, name: user.name },
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    const saved = commentText;
    setCommentText("");
    setSubmittingComment(true);

    try {
      const res = await api.post(`/posts/${id}/comments`, { text: saved });
      // Replace with real comments from server
      setComments(res.data.comments || []);
    } catch {
      // Revert optimistic comment on failure
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      setCommentText(saved);
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading)
    return <p className="text-center text-muted py-16 font-serif">Loading…</p>;
  if (!post)
    return (
      <p className="text-center text-muted py-16 font-serif">Post not found.</p>
    );

  const liked = user && likes.includes(user._id);
  const isOwner = user && String(user._id) === String(post.author?._id);
  const topic = getTopic(post.topic);

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 font-mono text-xs text-muted uppercase tracking-wide mb-2 flex-wrap">
        <span>@{post.author?.username}</span>
        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span>·</span>
        <span className="text-accent flex items-center gap-1">
          {topic.emoji} {topic.label}
        </span>
        {isOwner && (
          <>
            <span>·</span>
            <Link to={`/post/${id}/edit`} className="hover:text-accent">
              Edit
            </Link>
            <span>·</span>
            <button onClick={handleDelete} className="hover:text-red-500">
              Delete
            </button>
          </>
        )}
      </div>

      <h1 className="font-display text-3xl font-bold mb-6">{post.title}</h1>

      {post.image && (
        <img
          src={getImageUrl(post.image)}
          alt=""
          className="w-full max-h-96 object-cover rounded-md border border-border mb-8"
        />
      )}

      <div
        className="prose prose-lg max-w-none font-serif mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={handleLike}
          disabled={!user}
          className={`font-mono text-sm px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
            liked
              ? "bg-accent text-paper border-accent"
              : "border-border hover:border-accent"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {liked ? "Liked" : "Like"} · {likes.length}
        </button>

        <button
          onClick={handleBookmark}
          disabled={!user}
          className={`font-mono text-sm px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
            bookmarked
              ? "bg-accent text-paper border-accent"
              : "border-border hover:border-accent"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {bookmarked ? "Saved" : "Save"} · {bookmarkCount}
        </button>
      </div>

      {/* Comments */}
      <section className="border-t border-border pt-6">
        <h2 className="font-display font-bold mb-4">
          Comments ({comments.length})
        </h2>

        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-6">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="font-mono text-sm bg-ink text-paper px-4 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              Post
            </button>
          </form>
        )}

        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c._id}
              className={`border-b border-border pb-3 transition-opacity ${c._id?.startsWith("temp-") ? "opacity-60" : "opacity-100"}`}
            >
              <div className="font-mono text-xs text-muted uppercase tracking-wide mb-1">
                @{c.author?.username}
              </div>
              <p className="font-serif">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
