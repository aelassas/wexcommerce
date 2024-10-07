'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Home: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return null
}

export default Home
