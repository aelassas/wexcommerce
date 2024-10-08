import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const env = {
  isMobile: () => window.innerWidth <= 960,
  isTablet: () => window.innerWidth >= 500 && window.innerWidth <= 960,
  isLandscape: () => window.innerHeight <= 566,
  isProduction: process.env.NODE_ENV === 'production',

  APP_TYPE: 'frontend',
  API_HOST: process.env.NEXT_PUBLIC_WC_API_HOST,
  LANGUAGES: ['fr', 'en'],
  _LANGUAGES: [
    {
      code: 'fr',
      label: 'Français'
    },
    {
      code: 'en',
      label: 'English'
    }
  ],
  DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_WC_DEFAULT_LANGUAGE || 'en',
  PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_PAGE_SIZE || '30'),
  CDN_PRODUCTS: process.env.NEXT_PUBLIC_WC_CDN_PRODUCTS,
  CDN_CATEGORIES: process.env.NEXT_PUBLIC_WC_CDN_CATEGORIES,
  FB_APP_ID: String(process.env.NEXT_PUBLIC_WC_FB_APP_ID),
  APPLE_ID: String(process.env.NEXT_PUBLIC_WC_APPLE_ID),
  GG_APP_ID: String(process.env.NEXT_PUBLIC_WC_GG_APP_ID),
  STRIPE_PUBLISHABLE_KEY: String(process.env.NEXT_PUBLIC_WC_STRIPE_PUBLISHABLE_KEY),
  FEATURED_PRODUCTS_SIZE: 10,
  GOOGLE_ANALYTICS_ENABLED: (process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ENABLED && process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ENABLED.toLowerCase()) === 'true',
  GOOGLE_ANALYTICS_ID: String(process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ID),
}

export const CookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 100 * 365 * 24 * 60 * 60,
}

export default env
