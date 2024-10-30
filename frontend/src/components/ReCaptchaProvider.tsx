import React, { ReactNode, useEffect, useState } from 'react'
import { ReCaptchaProvider as NextReCaptchaProvider } from 'next-recaptcha-v3'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'

interface ReCaptchaProviderProps {
  children: ReactNode
}

const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('')

  const setRecaptchaVisibilty = (visible: boolean) => {
    const recaptchaBadge = document.querySelector('.grecaptcha-badge') as HTMLElement
    if (recaptchaBadge) {
      recaptchaBadge.style.visibility = visible ? 'visible' : 'hidden'
    }
  }

  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await UserService.getLanguage()
      setLanguage(lang)
      setRecaptchaVisibilty(true)
    }

    fetchLanguage()

    return () => {
      setRecaptchaVisibilty(false)
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
