import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'

// Create context
export interface UserContextType {
  user: wexcommerceTypes.User | null
  setUser: React.Dispatch<React.SetStateAction<wexcommerceTypes.User | null>>
}

const UserContext = createContext<UserContextType | null>(null)

// Create a provider
interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<wexcommerceTypes.User | null>(null)
  const value = useMemo(() => ({ user, setUser }), [user])

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  )
}

// Create a custom hook to access context
export const useUserContext = () => useContext(UserContext)
