import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-border bg-paper sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="font-display font-bold text-xl tracking-tight shrink-0"
        >
          Inkline
        </Link>
        <SearchBar />
        <nav className="flex items-center gap-5 font-mono text-sm">
          <ThemeToggle />
          {user ? (
            <>
              {/* Inbox with unread badge */}
              <Link
                to="/inbox"
                className="relative hover:text-accent transition-colors"
                aria-label="Inbox"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-paper font-mono text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/create"
                className="hover:text-accent transition-colors"
              >
                New post
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="hover:text-accent transition-colors"
              >
                @{user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-muted hover:text-ink transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-ink text-paper px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
