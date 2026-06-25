import Notification from '../models/Notification.js'

export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('sender', 'name username')
      .populate('post', 'title')
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Could not load notifications.', error: err.message })
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Could not get count.', error: err.message })
  }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read.' })
  } catch (err) {
    res.status(500).json({ message: 'Could not update notifications.', error: err.message })
  }
}

export async function markOneRead(req, res) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    )
    res.json({ message: 'Notification marked as read.' })
  } catch (err) {
    res.status(500).json({ message: 'Could not update notification.', error: err.message })
  }
}
