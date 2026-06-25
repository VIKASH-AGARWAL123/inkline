import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [count, setCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) { setCount(0); setNotifications([]); return }
    api.get('/notifications/unread-count').then((res) => setCount(res.data.count)).catch(() => {})
    api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!socket) return
    function onNew(notif) {
      setCount((c) => c + 1)
      setNotifications((prev) => [notif, ...prev].slice(0, 30))
    }
    socket.on('new_notification', onNew)
    return () => socket.off('new_notification', onNew)
  }, [socket])

  async function markAllRead() {
    await api.put('/notifications/read-all')
    setCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <NotificationContext.Provider value={{ count, notifications, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
