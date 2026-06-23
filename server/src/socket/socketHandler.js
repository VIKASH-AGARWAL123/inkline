import Message from '../models/Message.js'

export function registerSocketHandlers(io, socket) {
  const me = socket.user

  // Put user in their own personal room so we can notify them directly
  socket.join(`user:${me._id}`)

  // ── join_conversation ──────────────────────────────────────────────
  // Client calls this when opening a chat with a specific user.
  // We send back the last 50 messages and mark unread ones as read.
  socket.on('join_conversation', async ({ withUserId }) => {
    try {
      const convId = Message.makeConversationId(me._id, withUserId)
      socket.join(`conv:${convId}`)

      const history = await Message.find({ conversationId: convId })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate('sender', 'name username')
        .populate('receiver', 'name username')

      socket.emit('message_history', history)

      // Mark messages sent TO me as read
      await Message.updateMany(
        { conversationId: convId, receiver: me._id, read: false },
        { read: true }
      )
    } catch (err) {
      socket.emit('error', { message: 'Could not load conversation.' })
    }
  })

  // ── send_message ───────────────────────────────────────────────────
  socket.on('send_message', async ({ toUserId, text }) => {
    try {
      if (!text?.trim()) return

      const convId = Message.makeConversationId(me._id, toUserId)

      const message = await Message.create({
        conversationId: convId,
        sender: me._id,
        receiver: toUserId,
        text: text.trim(),
      })

      await message.populate('sender', 'name username')
      await message.populate('receiver', 'name username')

      // Broadcast to everyone in the conversation room (both users if online)
      io.to(`conv:${convId}`).emit('new_message', message)

      // Also notify receiver's personal room (for inbox badge, etc.)
      io.to(`user:${toUserId}`).emit('message_notification', {
        from: { _id: me._id, name: me.name, username: me.username },
        text: message.text,
        conversationId: convId,
      })
    } catch (err) {
      socket.emit('error', { message: 'Could not send message.' })
    }
  })

  // ── typing indicators ──────────────────────────────────────────────
  socket.on('typing', ({ toUserId }) => {
    const convId = Message.makeConversationId(me._id, toUserId)
    socket.to(`conv:${convId}`).emit('user_typing', {
      userId: me._id,
      username: me.username,
    })
  })

  socket.on('stop_typing', ({ toUserId }) => {
    const convId = Message.makeConversationId(me._id, toUserId)
    socket.to(`conv:${convId}`).emit('user_stop_typing', { userId: me._id })
  })

  socket.on('disconnect', () => {
    // nothing extra needed — Socket.io auto-removes rooms on disconnect
  })
}
