import * as fetchInstance from './fetchInstance'
import * as UserService from '@/lib/UserService'

/**
 * Order item name max length 200 characters
 * https://developer.paypal.com/docs/api/invoicing/v2/#invoices_create!ct=application/json&path=items/name&t=request
 *
 * @type {200}
 */
export const ORDER_NAME_MAX_LENGTH = 200

/**
 * Order item description max length 1000 characters
 * https://developer.paypal.com/docs/api/invoicing/v2/#invoices_create!ct=application/json&path=items/description&t=request
 *
 * @type {1000}
 */
export const ORDER_DESCRIPTION_MAX_LENGTH = 1000

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
export const createOrder = (orderId: string, amount: number, currency: string, name: string, description: string): Promise<string> =>
  fetchInstance
    .POST(
      '/api/create-paypal-order/',
      {
        orderId,
        amount,
        currency,
        name,
        description,
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
