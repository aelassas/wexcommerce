'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { CurrencyContextType, useCurrencyContext } from '@/context/CurrencyContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { NotificationContextType, useNotificationContext } from '@/context/NotificationContext'
import * as helper from '@/utils/helper'
import { strings } from '@/lang/dashboard'
import * as SettingService from '@/lib/SettingService'
import * as UserService from '@/lib/UserService'
import * as NotificationService from '@/lib/NotificationService'
import Header from '@/components/Header'

type LayoutProps = Readonly<{
  children: React.ReactNode
}>

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  const { language, setLanguage } = useLanguageContext() as LanguageContextType
  const { user, setUser } = useUserContext() as UserContextType
  const { setCurrency } = useCurrencyContext() as CurrencyContextType
  const { setNotificationCount } = useNotificationContext() as NotificationContextType

  const signout = async () => {
    setUser(null)
    await UserService.signout()
  }

  useEffect(() => {
    const init = async () => {
      const currentUser = await UserService.getCurrentUser()

      if (currentUser) {
        try {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const _user = await UserService.getUser(currentUser._id!)

            if (!_user) {
              router.replace('/sign-in')
            }

            const notificationCounter = await NotificationService.getNotificationCounter(_user._id!)
            setNotificationCount(notificationCounter.count)

            setUser(_user)
          } else {
            await signout()
          }

          const lang = await SettingService.getLanguage()
          setLanguage(lang)

          const currency = await SettingService.getCurrency()
          setCurrency(currency)
        } catch (err) {
          console.error(err)
          await signout()
        }
      } else {
        router.replace('/sign-in')
      }
    }

    init()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async (e: React.MouseEvent<HTMLElement>) => {
    try {
      e.preventDefault()
      const data = { email: user!.email }

      const status = await UserService.resendLink(data)

      if (status === 200) {
        helper.info(strings.VALIDATION_EMAIL_SENT)
      } else {
        helper.error(strings.VALIDATION_EMAIL_ERROR)
      }
    } catch (err) {
      helper.error(err, strings.VALIDATION_EMAIL_ERROR)
    }
  }

  return user && language && (
    <>
      <Header />
      {
        user.verified
          ? (
            <div className="content">{children}</div>
          )
          : (
            <div className="validate-email">
              <span>{strings.VALIDATE_EMAIL}</span>
              <Button
                type="button"
                variant="contained"
                size="small"
                className="btn-primary btn-resend"
                onClick={handleResend}
              >{strings.RESEND}</Button>
            </div>
          )
      }
    </>
  )
}

export default Layout
