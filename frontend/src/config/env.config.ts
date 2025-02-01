import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import * as wexcommerceTypes from ':wexcommerce-types'

const getPaymentGateway = () => {
  const paymentGateway = String(process.env.NEXT_PUBLIC_WC_PAYMENT_GATEWAY || 'stripe').toUpperCase()

  if (paymentGateway === 'PAYPAL') {
    return wexcommerceTypes.PaymentGateway.PayPal
  }

  // Default is Stripe
  return wexcommerceTypes.PaymentGateway.Stripe
}

const PAYMENT_GATEWAY = getPaymentGateway()

const env = {
  isMobile: () => window.innerWidth <= 960,
  isTablet: () => window.innerWidth >= 500 && window.innerWidth <= 960,
  isLandscape: () => window.innerHeight <= 566,
  isServer: () => typeof window === 'undefined',
  isProduction: () => process.env.NODE_ENV === 'production',
  isSafari: typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent),

  WEBSITE_NAME: String(process.env.NEXT_PUBLIC_WC_WEBSITE_NAME || 'wexCommerce'),
  APP_TYPE: 'frontend',
  SERVER_API_HOST: String(process.env.NEXT_PUBLIC_WC_SERVER_API_HOST),
  CLIENT_API_HOST: String(process.env.NEXT_PUBLIC_WC_CLIENT_API_HOST),
  DEFAULT_LANGUAGE: String(process.env.NEXT_PUBLIC_WC_DEFAULT_LANGUAGE || 'en'),
  PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_PAGE_SIZE || '30'),
  ORDERS_PAGE_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_ORDERS_PAGE_SIZE || '4', 10),
  CDN_PRODUCTS: String(process.env.NEXT_PUBLIC_WC_CDN_PRODUCTS),
  CDN_CATEGORIES: String(process.env.NEXT_PUBLIC_WC_CDN_CATEGORIES),
  FB_APP_ID: String(process.env.NEXT_PUBLIC_WC_FB_APP_ID),
  APPLE_ID: String(process.env.NEXT_PUBLIC_WC_APPLE_ID),
  GG_APP_ID: String(process.env.NEXT_PUBLIC_WC_GG_APP_ID),
  PAYMENT_GATEWAY,
  STRIPE_PUBLISHABLE_KEY: String(process.env.NEXT_PUBLIC_WC_STRIPE_PUBLISHABLE_KEY),
  PAYPAL_CLIENT_ID: String(process.env.NEXT_PUBLIC_WC_PAYPAL_CLIENT_ID),
  FEATURED_PRODUCTS_SIZE: Number.parseInt(process.env.NEXT_PUBLIC_WC_FEATURED_PRODUCTS_SIZE || '10', 10),
  GOOGLE_ANALYTICS_ENABLED: (process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ENABLED && process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ENABLED.toLowerCase()) === 'true',
  GOOGLE_ANALYTICS_ID: String(process.env.NEXT_PUBLIC_WC_GOOGLE_ANALYTICS_ID),
  CARROUSEL_SIZE: 3,
  RECAPTCHA_ENABLED: (process.env.NEXT_PUBLIC_WC_RECAPTCHA_ENABLED && process.env.NEXT_PUBLIC_WC_RECAPTCHA_ENABLED.toLowerCase()) === 'true',
  RECAPTCHA_SITE_KEY: String(process.env.NEXT_PUBLIC_WC_RECAPTCHA_SITE_KEY),
  CONTACT_EMAIL: String(process.env.NEXT_PUBLIC_WC_CONTACT_EMAIL),
}

export const CookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 100 * 365 * 24 * 60 * 60,
}

export default env
