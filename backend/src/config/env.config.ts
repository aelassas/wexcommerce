import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const env = {
  isMobile: () => window.innerWidth <= 960,
  isTablet: () => window.innerWidth >= 500 && window.innerWidth <= 960,
  isLandscape: () => window.innerHeight <= 566,
  isServer: () => typeof window === 'undefined',

  APP_TYPE: 'backend',
  SERVER_API_HOST: process.env.NEXT_PUBLIC_WC_SERVER_API_HOST,
  CLIENT_API_HOST: process.env.NEXT_PUBLIC_WC_CLIENT_API_HOST,
  LANGUAGES: ['en', 'fr'],
  _LANGUAGES: [
    {
      code: 'en',
      label: 'English'
    },
    {
      code: 'fr',
      label: 'Français'
    },
  ],
  DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_WC_DEFAULT_LANGUAGE || 'en',
  PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_PAGE_SIZE || '30', 10),
  CDN_USERS: process.env.NEXT_PUBLIC_WC_CDN_USERS,
  CDN_TEMP_USERS: process.env.NEXT_PUBLIC_WC_CDN_TEMP_USERS,
  CDN_CATEGORIES: process.env.NEXT_PUBLIC_WC_CDN_CATEGORIES,
  CDN_TEMP_CATEGORIES: process.env.NEXT_PUBLIC_WC_CDN_TEMP_CATEGORIES,
  CDN_PRODUCTS: process.env.NEXT_PUBLIC_WC_CDN_PRODUCTS,
  CDN_TEMP_PRODUCTS: process.env.NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS,
}

export const CookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 100 * 365 * 24 * 60 * 60,
}

export default env
