import React, { ReactNode, useEffect, useState } from 'react'
import { ReCaptchaProvider as NextReCaptchaProvider } from 'next-recaptcha-v3'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'

interface ReCaptchaProviderProps {
  children: ReactNode
}

const ReCaptchaProvider = ({ children }: ReCaptchaProviderProps) => {
  const [language, setLanguage] = useState('')

  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await UserService.getLanguage()
      setLanguage(lang)

      const recaptchaBadgeElement = document.querySelector('.grecaptcha-badge') as HTMLElement
      if (recaptchaBadgeElement) {
        recaptchaBadgeElement.style.visibility = 'visible'
      }
    }

    fetchLanguage()

    return () => {
      const recaptchaBadgeElement = document.querySelector('.grecaptcha-badge') as HTMLElement
      if (recaptchaBadgeElement) {
        recaptchaBadgeElement.style.visibility = 'hidden'
      }
    }
  }, [])

  if (!env.RECAPTCHA_ENABLED) {
    return children
  }

  return language && (
    <NextReCaptchaProvider
      reCaptchaKey={env.RECAPTCHA_SITE_KEY}
      language={language}
    >
      {children}
    </NextReCaptchaProvider>
  )
}

export default ReCaptchaProvider
