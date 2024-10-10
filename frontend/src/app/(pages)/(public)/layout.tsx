'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { NotificationContextType, useNotificationContext } from '@/context/NotificationContext'
import { CartContextType, useCartContext } from '@/context/CartContext'
import { useWishlistContext, WishlistContextType } from '@/context/WishlistContext'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as NotificationService from '@/lib/NotificationService'
import * as CartService from '@/lib/CartService'
import * as WishlistService from '@/lib/WishlistService'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type LayoutProps = Readonly<{
  children: React.ReactNode
}>

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguageContext() as LanguageContextType
  const { setUser } = useUserContext() as UserContextType
  const { setCurrency } = useCurrencyContext() as CurrencyContextType
  const { setNotificationCount } = useNotificationContext() as NotificationContextType
  const { setCartItemCount } = useCartContext() as CartContextType
  const { setWishlistCount } = useWishlistContext() as WishlistContextType

  const signout = async (redirect: boolean) => {
    setUser(null)
    await UserService.signout(redirect)
  }

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()

      let cartId: string | undefined = await CartService.getCartId()
      let wishlistId: string | undefined = await WishlistService.getWishlistId()

      if (currentUser) {
        try {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const _user = await UserService.getUser(currentUser._id!)

            if (_user) {
              setUser(_user)
              if (!cartId) {
                cartId = await CartService.getUserCartId(_user._id!)
                await CartService.setCartId(cartId)
              } else {
                //
                // Set current cart
                //
                await CartService.updateCart(cartId, _user._id!)
                //
                // Clear other carts different from (cartId, userId)
                //
                await CartService.clearOtherCarts(cartId, _user._id!)
              }
              if (!wishlistId) {
                wishlistId = await WishlistService.getUserWishlistId(_user._id!)
                await WishlistService.setWishlistId(wishlistId)
              } else {
                await WishlistService.updateWishlist(wishlistId, _user._id!)
              }

              const notificationCounter = await NotificationService.getNotificationCounter(_user._id!)
              setNotificationCount(notificationCounter.count)
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

      const currency = await SettingService.getCurrency()
      setCurrency(currency)

      const cartItemCount = (await CartService.getCartCount(
        cartId
      )) || 0
      setCartItemCount(cartItemCount)

      const wishlistCount = (await WishlistService.getWishlistCount(
        wishlistId
      )) || 0
      setWishlistCount(wishlistCount)
    }

    init()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return language && (
    <>
      <Header />
      <div className='content'>{children}</div>
      <Footer />
    </>
  )
}

export default Layout
