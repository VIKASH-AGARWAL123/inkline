import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-border bg-paper sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display font-bold text-xl tracking-tight shrink-0">
          Inkline
        </Link>
        <SearchBar />
        <nav className="flex items-center gap-5 font-mono text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/create" className="hover:text-accent transition-colors">
                New post
              </Link>
              <Link to={`/profile/${user._id}`} className="hover:text-accent transition-colors">
                @{user.username}
              </Link>
              <button onClick={handleLogout} className="text-muted hover:text-ink transition-colors">
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
  )
}
