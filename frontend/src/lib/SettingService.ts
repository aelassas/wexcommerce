'use server'

import * as fetchInstance from './fetchInstance'

/**
 * Get current language.
 *
 * @returns {Promise<string>}
 */
export const getLanguage = async (): Promise<string> =>
  fetchInstance
    .GET(
      '/api/language'
    )
    .then((res) => res.data)

/**
 * Get current currency.
 *
 * @returns {Promise<string>}
 */
export const getCurrency = async (): Promise<string> =>
  fetchInstance
    .GET(
      '/api/currency'
    )
    .then((res) => res.data)

/**
* Get current Stripe currency.
*
* @returns {Promise<string>}
*/
export const getStripeCurrency = async (): Promise<string> =>
  fetchInstance
    .GET(
      '/api/stripe-currency'
    )
    .then((res) => res.data)
