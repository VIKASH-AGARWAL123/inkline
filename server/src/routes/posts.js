import express from 'express'
import { getPosts, createPost, getPost, toggleLike, addComment, searchPosts } from '../controllers/postController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', protect, upload.single('image'), createPost)
router.get('/search', searchPosts)
router.get('/:id', getPost)
router.post('/:id/like', protect, toggleLike)
router.post('/:id/comments', protect, addComment)

export default router
