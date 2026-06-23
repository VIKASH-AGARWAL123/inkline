import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function loadProfile() {
    setLoading(true);
    Promise.all([api.get(`/users/${id}`), api.get(`/users/${id}/posts`)])
      .then(([userRes, postsRes]) => {
        setProfile(userRes.data);
        setPosts(postsRes.data);
      })
      .finally(() => setLoading(false));
  }

  async function handleFollow() {
    await api.post(`/users/${id}/follow`);
    loadProfile();
  }

  if (loading)
    return <p className="text-center text-muted py-16 font-serif">Loading…</p>;
  if (!profile)
    return (
      <p className="text-center text-muted py-16 font-serif">User not found.</p>
    );

  const isOwnProfile = currentUser?._id === id;
  const isFollowing = profile.followers?.includes(currentUser?._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
          <p className="font-mono text-sm text-muted">@{profile.username}</p>
          <p className="font-serif text-ink/80 mt-2">{profile.bio}</p>
          <div className="flex gap-4 mt-2 font-mono text-xs text-muted">
            <span>{profile.followers?.length || 0} followers</span>
            <span>{profile.following?.length || 0} following</span>
          </div>
        </div>
        {!isOwnProfile && currentUser && (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleFollow}
              className={`font-mono text-sm px-4 py-2 rounded-md border transition-colors ${
                isFollowing
                  ? "border-border text-muted"
                  : "bg-ink text-paper border-ink hover:bg-accent hover:border-accent"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <Link
              to={`/conversation/${id}`}
              className="font-mono text-sm px-4 py-2 rounded-md border border-border text-center hover:border-accent hover:text-accent transition-colors"
            >
              Message
            </Link>
          </div>
        )}
      </div>
      <h2 className="font-display font-bold mb-4 border-t border-border pt-6">
        Posts
      </h2>
      {posts.length === 0 ? (
        <p className="text-muted font-serif">No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
