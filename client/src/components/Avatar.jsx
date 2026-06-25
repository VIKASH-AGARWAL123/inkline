import { getAvatarUrl } from "../utils/getImageUrl";
import { useIsOnline } from "../context/OnlineContext";

export default function Avatar({
  user,
  size = "md",
  showOnline = false,
  className = "",
}) {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
  };

  const isOnline = useIsOnline(user?._id || user?.id);
  const avatarUrl = getAvatarUrl(user?.avatar, user?.name || user?.username);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full overflow-hidden border border-border`}
      >
        <img
          src={avatarUrl}
          alt={user?.name || "User"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://api.dicebear.com/8.x/thumbs/svg?seed=fallback`;
          }}
        />
      </div>
      {showOnline && isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full bg-green-500 border-2 border-paper`}
        />
      )}
    </div>
  );
}
