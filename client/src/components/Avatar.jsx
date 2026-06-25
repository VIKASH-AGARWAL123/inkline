import { getAvatarUrl } from '../utils/getImageUrl'

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const avatarUrl = getAvatarUrl(user?.avatar, user?.name || user?.username)

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden shrink-0 border border-border ${className}`}>
      <img
        src={avatarUrl}
        alt={user?.name || 'User'}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://api.dicebear.com/8.x/thumbs/svg?seed=fallback`
        }}
      />
    </div>
  )
}
