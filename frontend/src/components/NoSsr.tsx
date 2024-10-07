import React, { ReactNode, useEffect, useState } from 'react'

interface NoSsr {
  children: ReactNode
}

const NoSsr: React.FC<NoSsr> = ({ children }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return <>
    {mounted ? children : null}
  </>
}

export default NoSsr
