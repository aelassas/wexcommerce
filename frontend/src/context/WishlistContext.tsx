import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

// Create context
export interface WishlistContextType {
  wishlistCount: number
  setWishlistCount: React.Dispatch<React.SetStateAction<number>>
}

const WishlistContext = createContext<WishlistContextType | null>(null)

// Create a provider
interface WishlistProviderProps {
  children: ReactNode
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0)
  const value = useMemo(() => ({ wishlistCount, setWishlistCount }), [wishlistCount])

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

// Create a custom hook to access context
export const useWishlistContext = () => useContext(WishlistContext)
