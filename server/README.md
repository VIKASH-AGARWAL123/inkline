# Inkline — server

Express + MongoDB API for the social blog app. Matches the contract the React client already expects.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — a local MongoDB (`mongodb://localhost:27017/inkline`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string
- `JWT_SECRET` — any long random string

```bash
npm run dev
```

Runs at http://localhost:5000. Health check: `GET /api/health`.

## Structure

```
server.js                    app entry, middleware, route mounting
src/
  config/db.js                mongoose connection
  models/User.js               schema, password hashing, follow lists
  models/Post.js                schema with embedded comments
  middleware/auth.js            verifies JWT, attaches req.user
  controllers/                  route handlers
  routes/                       auth.js, posts.js, users.js
  utils/generateToken.js        signs JWTs
  utils/generateUsername.js     derives a unique @handle from the user's name
```

## Routes

| Method | Endpoint               | Auth | Body / query                 |
|--------|--------------------------|------|---------------------------------|
| POST   | /api/auth/register        | —    | name, email, password           |
| POST   | /api/auth/login            | —    | email, password                 |
| GET    | /api/auth/me                | yes  | —                                |
| GET    | /api/posts                   | —    | ?page, ?limit (paginated feed)  |
| POST   | /api/posts                    | yes  | multipart: title, content, image (optional) |
| GET    | /api/posts/search               | —    | ?q                                |
| GET    | /api/posts/:id                    | —    | —                                  |
| POST   | /api/posts/:id/like                 | yes  | —                                  |
| POST   | /api/posts/:id/comments               | yes  | text                                |
| GET    | /api/users/search                       | —    | ?q                                    |
| GET    | /api/users/:id                            | —    | —                                      |
| GET    | /api/users/:id/posts                        | —    | —                                        |
| POST   | /api/users/:id/follow                         | yes  | —                                          |

Authenticated routes need `Authorization: Bearer <token>`.

`GET /api/posts` returns `{ posts, page, hasMore }` instead of a bare array, so the client can paginate.

## Notes

- Registration only collects name/email/password — `generateUsername` derives a unique `@handle` from the name automatically (e.g. "Ada Lovelace" → `@adalovelace`, with a number appended on collision).
- Passwords are hashed with bcrypt before save; plaintext is never stored or returned.
- Likes and follows are both implemented as toggles — calling the same endpoint twice undoes the action, matching what the client's UI buttons expect.
- Post images are uploaded via `multipart/form-data` (field name `image`), saved to `/uploads`, and served statically at `http://localhost:5000/uploads/<filename>`. 5MB limit, images only. No third-party storage account needed — fine for local dev and demos; swap for S3/Cloudinary before deploying somewhere the disk isn't persistent.
- Search is a case-insensitive regex match on post title/content or user name/username — fine at this scale, not a substitute for a real text index if the dataset grows large.
- For local Mongo, install and run `mongod` separately, or use Docker: `docker run -d -p 27017:27017 mongo`.
