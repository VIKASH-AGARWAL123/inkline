# Inkline — client

React frontend for the social blog app (Vite + Tailwind). Talks to an Express/MongoDB API that isn't built yet — see the contract below so the backend matches what this UI expects.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your API
npm run dev
```

Runs at http://localhost:5173 by default.

## Structure

```
src/
  context/AuthContext.jsx   session state, login/register/logout
  services/api.js           axios instance, attaches JWT automatically
  components/                Navbar, PostCard, ProtectedRoute
  pages/                     Feed, Login, Register, Profile, PostDetail, CreatePost
```

## API contract expected by this client

| Method | Endpoint                  | Body                    | Returns                          |
|--------|----------------------------|--------------------------|-----------------------------------|
| POST   | /auth/register             | name, email, password    | { token, user }                   |
| POST   | /auth/login                 | email, password          | { token, user }                   |
| GET    | /auth/me                    | —                        | user                              |
| GET    | /posts                      | —                        | post[]                            |
| POST   | /posts                      | title, content           | post                              |
| GET    | /posts/:id                  | —                        | post (with author, likes, comments) |
| POST   | /posts/:id/like              | —                        | updated post                      |
| POST   | /posts/:id/comments          | text                     | updated post                      |
| GET    | /users/:id                   | —                        | user (with followers, following)  |
| GET    | /users/:id/posts              | —                        | post[]                            |
| POST   | /users/:id/follow             | —                        | updated user                      |

`user` shape: `{ _id, name, username, email, bio, followers: [id], following: [id] }`
`post` shape: `{ _id, title, content, author, likes: [id], comments: [{_id, text, author}], createdAt }`

All authenticated routes expect `Authorization: Bearer <token>`.

## Design notes

Editorial feel: Space Grotesk for headings/UI, Source Serif 4 for post body copy, IBM Plex Mono for metadata (handles, timestamps, counts) — meant to read like a journal, not a generic dashboard. Single accent color (indigo) on a warm paper background. Easy to retheme via `tailwind.config.js`.

## Next step

Build the Express + MongoDB API matching the contract above (User, Post models; auth, posts, users routes; JWT middleware).
