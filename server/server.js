import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import postRoutes from './src/routes/posts.js'
import userRoutes from './src/routes/users.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
