'use client'

import React, { useEffect, useState } from 'react'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import * as PayPalService from '@/lib/PayPalService'
import * as SettingService from '@/lib/SettingService'

interface PayPalProviderProps {
  children: React.ReactNode
}

const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const [currency, setCurrency] = useState<string>()
  const [locale, setLocale] = useState<string>()

  useEffect(() => {
    const fetchLocale = async () => {
      const _locale = await PayPalService.getLocale()
      setLocale(_locale)

      const _currency = await SettingService.getStripeCurrency()
      setCurrency(_currency)
    }

    fetchLocale()
  }, [])

  return locale && currency && (
    env.PAYMENT_GATEWAY === wexcommerceTypes.PaymentGateway.PayPal ? (
      <PayPalScriptProvider
        options={{
          clientId: env.PAYPAL_CLIENT_ID,
          currency,
          intent: 'capture',
          locale,
          // buyerCountry: 'US',
        }}
      >
        {children}
      </PayPalScriptProvider>
    ) : children
  )
}

export { PayPalProvider }
