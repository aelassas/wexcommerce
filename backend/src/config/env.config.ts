import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

//
// ISO 639-1 language codes and their labels
// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
//
const LANGUAGES = [
  {
    code: 'en',
    label: 'English'
  },
  {
    code: 'fr',
    label: 'Français'
  },
]

const env = {
  isMobile: () => window.innerWidth <= 960,
  isTablet: () => window.innerWidth >= 500 && window.innerWidth <= 960,
  isLandscape: () => window.innerHeight <= 566,
  isServer: () => typeof window === 'undefined',

  APP_TYPE: 'backend',
  SERVER_API_HOST: String(process.env.NEXT_PUBLIC_WC_SERVER_API_HOST),
  CLIENT_API_HOST: String(process.env.NEXT_PUBLIC_WC_CLIENT_API_HOST),
  LANGUAGES,
  DEFAULT_LANGUAGE: String(process.env.NEXT_PUBLIC_WC_DEFAULT_LANGUAGE || 'en'),
  PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_PAGE_SIZE || '30', 10),
  ORDERS_PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_ORDERS_PAGE_SIZE || '4', 10),
  CDN_USERS: String(process.env.NEXT_PUBLIC_WC_CDN_USERS),
  CDN_TEMP_USERS: String(process.env.NEXT_PUBLIC_WC_CDN_TEMP_USERS),
  CDN_CATEGORIES: String(process.env.NEXT_PUBLIC_WC_CDN_CATEGORIES),
  CDN_TEMP_CATEGORIES: String(process.env.NEXT_PUBLIC_WC_CDN_TEMP_CATEGORIES),
  CDN_PRODUCTS: String(process.env.NEXT_PUBLIC_WC_CDN_PRODUCTS),
  CDN_TEMP_PRODUCTS: String(process.env.NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS),
}

export const CookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 100 * 365 * 24 * 60 * 60,
}

export default env
