import express from 'express'
import { getUser, getUserPosts, toggleFollow, searchUsers } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/search', searchUsers)
router.get('/:id', getUser)
router.get('/:id/posts', getUserPosts)
router.post('/:id/follow', protect, toggleFollow)

export default router
