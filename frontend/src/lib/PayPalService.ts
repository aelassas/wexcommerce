import * as fetchInstance from './fetchInstance'
import * as UserService from '@/lib/UserService'

/**
 * Returns PayPal locale.
 *
 * @returns {("fr_XC" | "es_XC" | "en_US")}
 */
export const getLocale = async () => {
  const lang = await UserService.getLanguage()

  if (lang === 'fr') {
    return 'fr_FR'
  }

  if (lang === 'es') {
    return 'es_ES'
  }

  // default is en_US
  return 'en_US'
}

/**
 * Create PayPal order.
 *
 * @param {string} sessionId
 * @returns {Promise<number>}
 */
export const createOrder = (orderId: string, amount: number, currency: string, name: string): Promise<string> =>
  fetchInstance
    .POST(
      '/api/create-paypal-order/',
      {
        orderId,
        amount,
        currency,
        name,
      }
    )
    .then((res) => res.data)

/**
 * Check PayPal order.
 *
 * @param {string} sessionId
 * @returns {Promise<number>}
 */
export const checkOrder = (paypalOrderId: string, orderId: string): Promise<number> =>
  fetchInstance
    .POST(
      `/api/check-paypal-order/${paypalOrderId}/${orderId}`,
      null,
      [],
      true
    )
    .then((res) => res.status)
