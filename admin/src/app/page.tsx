'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as UserService from '@/lib/UserService'

const Home = () => {
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()

      if (currentUser) {
        router.push('/orders')
      } else {
        router.push('/sign-in')
      }
    }

    init()
  }, [router])

  return null
}

export default Home
