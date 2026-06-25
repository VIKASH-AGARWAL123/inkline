import { useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import { getTopic } from "../utils/topics";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Avatar from "./Avatar";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [bookmarked, setBookmarked] = useState(
    post.bookmarks?.includes(user?._id),
  );
  const [bookmarkCount, setBookmarkCount] = useState(
    post.bookmarks?.length || 0,
  );
  const [deleted, setDeleted] = useState(false);

  const isOwner = user && String(user._id) === String(post.author?._id);
  const liked = user && likes.includes(user._id);
  const topic = getTopic(post.topic);

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleLike(e) {
    e.preventDefault();
    if (!user) return;
    // Optimistic update
    const alreadyLiked = likes.includes(user._id);
    setLikes((prev) =>
      alreadyLiked ? prev.filter((id) => id !== user._id) : [...prev, user._id],
    );
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch {
      // Revert on failure
      setLikes((prev) =>
        alreadyLiked
          ? [...prev, user._id]
          : prev.filter((id) => id !== user._id),
      );
    }
  }

  async function handleBookmark(e) {
    e.preventDefault();
    if (!user) return;
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);
    setBookmarkCount((c) => (wasBookmarked ? c - 1 : c + 1));
    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      setBookmarked(res.data.bookmarked);
      setBookmarkCount(res.data.count);
    } catch {
      setBookmarked(wasBookmarked);
      setBookmarkCount((c) => (wasBookmarked ? c + 1 : c - 1));
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm("Delete this post?")) return;
    // Optimistic — hide immediately
    setDeleted(true);
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
    } catch {
      setDeleted(false); // revert if server fails
    }
  }

  if (deleted) return null;

  return (
    <article className="border-b border-border py-6">
      <div className="flex items-center gap-2 font-mono text-xs text-muted mb-2 uppercase tracking-wide flex-wrap">
        <Avatar user={post.author} size="xs" />
        <span>@{post.author?.username}</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1 text-accent">
          <span>{topic.emoji}</span>
          <span>{topic.label}</span>
        </span>
        {isOwner && (
          <>
            <span>·</span>
            <Link
              to={`/post/${post._id}/edit`}
              className="hover:text-accent transition-colors"
            >
              Edit
            </Link>
            <span>·</span>
            <button
              onClick={handleDelete}
              className="hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>

      <Link to={`/post/${post._id}`} className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-bold mb-2 hover:text-accent transition-colors">
            {post.title}
          </h2>
          <div
            className="font-serif text-ink/80 leading-relaxed line-clamp-3 text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition-colors ${liked ? "text-accent" : "hover:text-accent"}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likes.length}
        </button>

        <span>{post.comments?.length || 0} comments</span>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 transition-colors ${bookmarked ? "text-accent" : "hover:text-accent"}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {bookmarkCount}
        </button>
      </div>
    </article>
  );
}
