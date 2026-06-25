import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/Avatar";

export default function Inbox() {
  const { user } = useAuth();
  const { clearUnread } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearUnread();
    api
      .get("/messages/inbox")
      .then((res) => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-center text-muted py-16 font-serif">Loading…</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Inbox</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted font-serif mb-2">No messages yet.</p>
          <p className="text-muted font-mono text-sm">
            Visit someone's profile to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            const other = conv.otherUser;
            const last = conv.lastMessage;
            const isMe = String(last.sender) === String(user._id);
            const date = new Date(last.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <Link
                key={conv._id}
                to={`/conversation/${other?._id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface border border-transparent hover:border-border transition-colors"
              >
                {/* Avatar initial */}
                <Avatar user={other} size="md" showOnline />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display font-bold text-sm truncate">
                      {other?.name}
                    </span>
                    <span className="font-mono text-xs text-muted shrink-0">
                      {date}
                    </span>
                  </div>
                  <p
                    className={`font-serif text-sm truncate ${conv.unreadCount > 0 ? "text-ink font-bold" : "text-muted"}`}
                  >
                    {isMe ? "You: " : ""}
                    {last.text}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="bg-accent text-paper font-mono text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
