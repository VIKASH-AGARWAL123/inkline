import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'

export default function Conversation() {
  const { userId } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()

  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  // Load other user's profile
  useEffect(() => {
    api.get(`/users/${userId}`).then((res) => setOtherUser(res.data))
  }, [userId])

  // Join conversation room and register listeners
  useEffect(() => {
    if (!socket) return

    socket.emit('join_conversation', { withUserId: userId })

    function onHistory(history) {
      setMessages(history)
      setLoading(false)
    }

    function onNewMessage(msg) {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }

    function onTyping({ userId: typer }) {
      if (String(typer) !== String(user._id)) setIsTyping(true)
    }

    function onStopTyping() {
      setIsTyping(false)
    }

    socket.on('message_history', onHistory)
    socket.on('new_message', onNewMessage)
    socket.on('user_typing', onTyping)
    socket.on('user_stop_typing', onStopTyping)

    return () => {
      socket.off('message_history', onHistory)
      socket.off('new_message', onNewMessage)
      socket.off('user_typing', onTyping)
      socket.off('user_stop_typing', onStopTyping)
    }
  }, [socket, userId, user._id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleTextChange(e) {
    setText(e.target.value)
    if (!socket) return
    socket.emit('typing', { toUserId: userId })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { toUserId: userId })
    }, 1500)
  }

  function sendMessage(e) {
    e.preventDefault()
    if (!text.trim() || !socket) return
    socket.emit('send_message', { toUserId: userId, text })
    socket.emit('stop_typing', { toUserId: userId })
    clearTimeout(typingTimeout.current)
    setText('')
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function formatDateDivider(dateStr) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Group messages and insert date dividers
  function buildMessageList() {
    const result = []
    let lastDate = null
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString()
      if (msgDate !== lastDate) {
        result.push({ type: 'divider', date: msg.createdAt, key: `d-${msg.createdAt}` })
        lastDate = msgDate
      }
      result.push({ type: 'message', msg, key: msg._id })
    })
    return result
  }

  const isMine = (msg) => String(msg.sender?._id || msg.sender) === String(user._id)

  return (
    <div className="max-w-xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-paper shrink-0">
        <Link to="/inbox" className="text-muted hover:text-ink transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-accent text-xs">
            {otherUser?.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-tight">{otherUser?.name}</p>
          <p className="font-mono text-xs text-muted">@{otherUser?.username}</p>
        </div>
        <Link
          to={`/profile/${userId}`}
          className="ml-auto font-mono text-xs text-accent hover:underline"
        >
          Profile
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && <p className="text-center text-muted font-serif py-8">Loading messages…</p>}

        {!loading && messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted font-serif">No messages yet.</p>
            <p className="text-muted font-mono text-sm mt-1">Say hello 👋</p>
          </div>
        )}

        {buildMessageList().map((item) => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-border" />
                <span className="font-mono text-xs text-muted shrink-0">
                  {formatDateDivider(item.date)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )
          }

          const { msg } = item
          const mine = isMine(msg)

          return (
            <div key={item.key} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-sm group relative`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl font-serif text-sm leading-relaxed ${
                    mine
                      ? 'bg-accent text-paper rounded-br-sm'
                      : 'bg-surface border border-border rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`font-mono text-xs text-muted mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    mine ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(msg.createdAt)}
                  {mine && msg.read && ' · Read'}
                </p>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="border-t border-border px-4 py-3 flex gap-2 bg-paper shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message…"
          className="flex-1 border border-border rounded-full px-4 py-2 bg-surface font-serif text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full bg-accent text-paper flex items-center justify-center hover:bg-accent-dark transition-colors disabled:opacity-40 shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
