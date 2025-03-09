'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { strings } from '@/lang/checkout-session'
import * as CartService from '@/lib/CartService'
import * as StripeService from '@/lib/StripeService'
import { CartContextType, useCartContext } from '@/context/CartContext'
import Info from '@/components/Info'
import NoMatch from '@/components/NoMatch'
import ScrollToTop from '@/components/ScrollToTop'

const CheckoutSession = () => {
  const searchParams = useSearchParams()

  const { setCartItemCount } = useCartContext() as CartContextType
  const [loading, setLoading] = useState(true)
  const [noMatch, setNoMatch] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      const checkSession = async () => {
        try {
          setLoading(true)
          const status = await StripeService.checkCheckoutSession(sessionId)
          const _success = status === 200

          if (_success) {
            await CartService.clearCart()
            await CartService.deleteCartId()
            setCartItemCount(0)
          }

          setNoMatch(!_success)
          setSuccess(_success)
        } catch (err) {
          console.error(err)
          setSuccess(false)
        } finally {
          setLoading(false)
        }
      }

      checkSession()
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ScrollToTop />
      {
        loading
          ? <Info message={strings.CHECKING} hideLink />
          : (
            noMatch
              ? <NoMatch />
              : (
                success
                  ? <Info message={strings.SUCCESS} />
                  : <Info message={strings.PAYMENT_FAILED} />
              )
          )
      }
    </>
  )
}

export default CheckoutSession
