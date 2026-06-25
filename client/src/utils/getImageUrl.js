const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SERVER_ORIGIN}${path}`;
}

export function getAvatarUrl(avatar, name) {
  if (avatar) return getImageUrl(avatar);
  // DiceBear avatars — random but consistent per username/name
  const seed = encodeURIComponent(name || "user");
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
