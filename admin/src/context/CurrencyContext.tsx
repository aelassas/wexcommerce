import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

// Create context
export interface CurrencyContextType {
  currency: string
  setCurrency: React.Dispatch<React.SetStateAction<string>>
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

// Create a provider
interface CurrencyProviderProps {
  children: ReactNode
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState('')
  const value = useMemo(() => ({ currency, setCurrency }), [currency])

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}

// Create a custom hook to access context
export const useCurrencyContext = () => useContext(CurrencyContext)
