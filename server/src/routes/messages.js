import express from 'express'
import { getInbox, getUnreadCount } from '../controllers/messageController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/inbox', protect, getInbox)
router.get('/unread-count', protect, getUnreadCount)

export default router
