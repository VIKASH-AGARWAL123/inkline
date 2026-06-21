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

| Method | Endpoint               | Auth | Body                 |
|--------|--------------------------|------|------------------------|
| POST   | /api/auth/register        | —    | name, email, password  |
| POST   | /api/auth/login            | —    | email, password        |
| GET    | /api/auth/me                | yes  | —                       |
| GET    | /api/posts                   | —    | —                       |
| POST   | /api/posts                    | yes  | title, content          |
| GET    | /api/posts/:id                 | —    | —                       |
| POST   | /api/posts/:id/like              | yes  | —                       |
| POST   | /api/posts/:id/comments           | yes  | text                    |
| GET    | /api/users/:id                     | —    | —                       |
| GET    | /api/users/:id/posts                 | —    | —                       |
| POST   | /api/users/:id/follow                  | yes  | —                       |

Authenticated routes need `Authorization: Bearer <token>`.

## Notes

- Registration only collects name/email/password — `generateUsername` derives a unique `@handle` from the name automatically (e.g. "Ada Lovelace" → `@adalovelace`, with a number appended on collision).
- Passwords are hashed with bcrypt before save; plaintext is never stored or returned.
- Likes and follows are both implemented as toggles — calling the same endpoint twice undoes the action, matching what the client's UI buttons expect.
- For local Mongo, install and run `mongod` separately, or use Docker: `docker run -d -p 27017:27017 mongo`.
