import React, { ReactNode, useEffect, useState } from 'react'

interface NoSsrProps {
  children: ReactNode
}

const NoSsr: React.FC<NoSsrProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return <>
    {mounted ? children : null}
  </>
}

export default NoSsr
