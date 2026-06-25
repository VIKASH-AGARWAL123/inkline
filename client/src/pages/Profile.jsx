import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [id]);

  function loadProfile() {
    setLoading(true);
    Promise.all([api.get(`/users/${id}`), api.get(`/users/${id}/posts`)])
      .then(([userRes, postsRes]) => {
        const p = userRes.data;
        setProfile(p);
        setPosts(postsRes.data);
        setFollowing(
          p.followers?.some((f) => String(f) === String(currentUser?._id)),
        );
        setFollowerCount(p.followers?.length || 0);
      })
      .finally(() => setLoading(false));
  }

  async function handleFollow() {
    // Optimistic
    const was = following;
    setFollowing(!was);
    setFollowerCount((c) => (was ? c - 1 : c + 1));
    try {
      await api.post(`/users/${id}/follow`);
    } catch {
      setFollowing(was);
      setFollowerCount((c) => (was ? c + 1 : c - 1));
    }
  }

  function handleDeletePost(postId) {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }

  if (loading)
    return <p className="text-center text-muted py-16 font-serif">Loading…</p>;
  if (!profile)
    return (
      <p className="text-center text-muted py-16 font-serif">User not found.</p>
    );

  const isOwnProfile =
    String(currentUser?._id) === String(id) ||
    String(currentUser?.id) === String(id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar user={profile} size="xl" showOnline />
          <div>
            <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
            <p className="font-mono text-sm text-muted">@{profile.username}</p>
            {profile.bio && (
              <p className="font-serif text-ink/80 mt-2 max-w-sm">
                {profile.bio}
              </p>
            )}
            <div className="flex gap-4 mt-2 font-mono text-xs text-muted">
              <span>
                <strong className="text-ink">{followerCount}</strong> followers
              </span>
              <span>
                <strong className="text-ink">
                  {profile.following?.length || 0}
                </strong>{" "}
                following
              </span>
              <span>
                <strong className="text-ink">{posts.length}</strong> posts
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {isOwnProfile ? (
            <Link
              to={`/profile/${id}/edit`}
              className="font-mono text-sm px-4 py-2 rounded-md border border-border hover:border-accent hover:text-accent transition-colors text-center"
            >
              Edit profile
            </Link>
          ) : (
            currentUser && (
              <>
                <button
                  onClick={handleFollow}
                  className={`font-mono text-sm px-4 py-2 rounded-md border transition-colors ${
                    following
                      ? "border-border text-muted"
                      : "bg-ink text-paper border-ink hover:bg-accent hover:border-accent"
                  }`}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <Link
                  to={`/conversation/${id}`}
                  className="font-mono text-sm px-4 py-2 rounded-md border border-border hover:border-accent hover:text-accent transition-colors text-center"
                >
                  Message
                </Link>
              </>
            )
          )}
        </div>
      </div>

      {/* Posts */}
      <h2 className="font-display font-bold mb-4 border-t border-border pt-6">
        Posts
      </h2>
      {posts.length === 0 ? (
        <p className="text-muted font-serif">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
        ))
      )}
    </div>
  );
}
