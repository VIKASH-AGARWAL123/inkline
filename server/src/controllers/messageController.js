import Message from '../models/Message.js'
import User from '../models/User.js'

// GET /api/messages/inbox
// Returns the latest message from each unique conversation the user is in
export async function getInbox(req, res) {
  try {
    const userId = req.user._id

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ])

    // Populate the other participant
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherId =
          String(conv.lastMessage.sender) === String(userId)
            ? conv.lastMessage.receiver
            : conv.lastMessage.sender
        const other = await User.findById(otherId).select('name username')
        return { ...conv, otherUser: other }
      })
    )

    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: 'Could not load inbox.', error: err.message })
  }
}

// GET /api/messages/unread-count
export async function getUnreadCount(req, res) {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Could not get count.', error: err.message })
  }
}
