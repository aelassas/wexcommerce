import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

// Create context
export interface CartContextType {
  cartItemCount: number
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>
}

const CartContext = createContext<CartContextType | null>(null)

// Create a provider
interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0)
  const value = useMemo(() => ({ cartItemCount, setCartItemCount }), [cartItemCount])

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

// Create a custom hook to access context
export const useCartContext = () => useContext(CartContext)
