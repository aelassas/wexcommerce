import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'

// Create context
export interface LanguageContextType {
  language: string
  setLanguage: React.Dispatch<React.SetStateAction<string>>
}

const LanguageContext = createContext<LanguageContextType | null>(null)

// Create a provider
interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState('')
  const value = useMemo(() => ({ language, setLanguage }), [language])

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

// Create a custom hook to access context
export const useLanguageContext = () => useContext(LanguageContext)
