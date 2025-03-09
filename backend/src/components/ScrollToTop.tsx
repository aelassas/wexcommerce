'use client'

import { useEffect } from 'react'

const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}

export default ScrollToTop
