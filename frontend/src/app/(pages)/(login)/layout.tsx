'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as CartService from '@/lib/CartService'
import { RecaptchaProvider } from '@/context/RecaptchaContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type LayoutProps = Readonly<{
  children: React.ReactNode
}>

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  const { language, setLanguage } = useLanguageContext() as LanguageContextType
  const { setUser } = useUserContext() as UserContextType
  const { setCartItemCount } = useCartContext() as CartContextType

  const signout = async (redirect: boolean) => {
    setUser(null)
    await UserService.signout(redirect)
  }

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()

      if (currentUser) {
        try {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const _user = await UserService.getUser(currentUser._id!)

            if (_user) {
              router.push('/')
            } else {
              await signout(false)
            }
          } else {
            await signout(false)
          }
        } catch (err) {
          console.error(err)
          await signout(false)
        }
      }

      const lang = await SettingService.getLanguage()
      setLanguage(lang)

      const cartItemCount = (await CartService.getCartCount(
        await CartService.getCartId()
      )) || 0
      setCartItemCount(cartItemCount)
    }

    init()
  }, [router, pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return language && (
    <RecaptchaProvider>
      <Header hideSearch />
      <div className='content'>{children}</div>
      <Footer />
    </RecaptchaProvider>
  )
}

export default Layout
