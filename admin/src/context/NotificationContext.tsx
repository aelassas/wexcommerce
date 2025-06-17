import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

// Create context
export interface NotificationContextType {
  notificationCount: number
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

// Create a provider
interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationCount, setNotificationCount] = useState(0)
  const value = useMemo(() => ({ notificationCount, setNotificationCount }), [notificationCount])

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

// Create a custom hook to access context
export const useNotificationContext = () => useContext(NotificationContext)
