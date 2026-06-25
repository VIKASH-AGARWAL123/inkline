import Message from '../models/Message.js'

// Track online users: Map<userId, socketId>
const onlineUsers = new Map()

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys())
}

export function registerSocketHandlers(io, socket) {
  const me = socket.user
  socket.join(`user:${me._id}`)

  // Mark user online and broadcast to everyone
  onlineUsers.set(String(me._id), socket.id)
  io.emit('online_users', Array.from(onlineUsers.keys()))
  console.log(`Socket connected: ${me.username} | Online: ${onlineUsers.size}`)

  socket.on('join_conversation', async ({ withUserId }) => {
    try {
      const convId = Message.makeConversationId(me._id, withUserId)
      socket.join(`conv:${convId}`)
      const history = await Message.find({ conversationId: convId })
        .sort({ createdAt: 1 }).limit(50)
        .populate('sender', 'name username avatar')
        .populate('receiver', 'name username avatar')
      socket.emit('message_history', history)
      await Message.updateMany(
        { conversationId: convId, receiver: me._id, read: false },
        { read: true }
      )
    } catch {
      socket.emit('error', { message: 'Could not load conversation.' })
    }
  })

  socket.on('send_message', async ({ toUserId, text, image }) => {
    try {
      if (!text?.trim() && !image) return
      const convId = Message.makeConversationId(me._id, toUserId)
      const message = await Message.create({
        conversationId: convId,
        sender: me._id,
        receiver: toUserId,
        text: text?.trim() || '',
        image: image || null,
      })
      await message.populate('sender', 'name username avatar')
      await message.populate('receiver', 'name username avatar')
      io.to(`conv:${convId}`).emit('new_message', message)
      io.to(`user:${toUserId}`).emit('message_notification', {
        from: { _id: me._id, name: me.name, username: me.username },
        text: image ? '📷 Photo' : message.text,
        conversationId: convId,
      })
    } catch {
      socket.emit('error', { message: 'Could not send message.' })
    }
  })

  socket.on('typing', ({ toUserId }) => {
    const convId = Message.makeConversationId(me._id, toUserId)
    socket.to(`conv:${convId}`).emit('user_typing', { userId: me._id, username: me.username })
  })

  socket.on('stop_typing', ({ toUserId }) => {
    const convId = Message.makeConversationId(me._id, toUserId)
    socket.to(`conv:${convId}`).emit('user_stop_typing', { userId: me._id })
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(String(me._id))
    io.emit('online_users', Array.from(onlineUsers.keys()))
    console.log(`Socket disconnected: ${me.username} | Online: ${onlineUsers.size}`)
  })
}
