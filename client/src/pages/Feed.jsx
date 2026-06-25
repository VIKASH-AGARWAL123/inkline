import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";
import TopicBar from "../components/TopicBar";
import SuggestionsSidebar from "../components/SuggestionsSidebar";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);

  function loadFirst(t) {
    setLoading(true);
    setError("");
    api
      .get("/posts", { params: { page: 1, topic: t } })
      .then((res) => {
        setPosts(res.data.posts);
        setHasMore(res.data.hasMore);
        setPage(1);
      })
      .catch(() => setError("Could not load the feed."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadFirst(topic);
  }, [topic]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    api
      .get("/posts", { params: { page: next, topic } })
      .then((res) => {
        setPosts((prev) => [...prev, ...res.data.posts]);
        setHasMore(res.data.hasMore);
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, topic]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex gap-8 items-start">
      <div className="flex-1 min-w-0">
        <TopicBar active={topic} onChange={(t) => setTopic(t)} />
        {loading && (
          <p className="text-center text-muted py-16 font-serif">
            Loading posts…
          </p>
        )}
        {error && <p className="text-center text-red-600 py-16">{error}</p>}
        {!loading && posts.length === 0 && (
          <p className="text-muted font-serif text-center py-8">
            No posts in this topic yet.
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={(id) =>
              setPosts((prev) => prev.filter((p) => p._id !== id))
            }
          />
        ))}
        <div ref={sentinelRef} />
        {loadingMore && (
          <p className="text-center text-muted py-6 font-mono text-sm">
            Loading more…
          </p>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-muted py-6 font-mono text-xs uppercase tracking-wide">
            You've reached the end
          </p>
        )}
      </div>
      <SuggestionsSidebar />
    </div>
  );
}
