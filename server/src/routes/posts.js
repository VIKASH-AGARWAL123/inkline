import express from 'express'
import { getPosts, createPost, getPost, toggleLike, addComment } from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', protect, createPost)
router.get('/:id', getPost)
router.post('/:id/like', protect, toggleLike)
router.post('/:id/comments', protect, addComment)

export default router
