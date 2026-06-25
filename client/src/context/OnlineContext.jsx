import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useSocket } from './SocketContext'

const OnlineContext = createContext([])

export function OnlineProvider({ children }) {
  const { socket } = useSocket()
  const [onlineIds, setOnlineIds] = useState([])

  // Fetch initial online list on mount
  useEffect(() => {
    api.get('/online-users').then((res) => setOnlineIds(res.data)).catch(() => {})
  }, [])

  // Keep in sync via socket broadcasts
  useEffect(() => {
    if (!socket) return
    function onOnlineUsers(ids) { setOnlineIds(ids) }
    socket.on('online_users', onOnlineUsers)
    return () => socket.off('online_users', onOnlineUsers)
  }, [socket])

  return (
    <OnlineContext.Provider value={onlineIds}>
      {children}
    </OnlineContext.Provider>
  )
}

export function useOnline() {
  return useContext(OnlineContext)
}

export function useIsOnline(userId) {
  const onlineIds = useContext(OnlineContext)
  if (!userId) return false
  return onlineIds.includes(String(userId))
}
