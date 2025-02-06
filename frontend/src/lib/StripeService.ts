import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'

/**
 * Order item name max length 250 characters
 * https://docs.stripe.com/upgrades
 *
 * @type {250}
 */
export const ORDER_NAME_MAX_LENGTH = 250

/**
 * Order item description max length 500 characters
 * https://docs.stripe.com/api/metadata
 *
 * @type {500}
 */
export const ORDER_DESCRIPTION_MAX_LENGTH = 500

/**
 * Create Checkout Session.
 *
 * @param {wexcommerceTypes.CreatePaymentPayload} payload
 * @returns {Promise<wexcommerceTypes.PaymentResult>}
 */
export const createCheckoutSession = async (payload: wexcommerceTypes.CreatePaymentPayload): Promise<wexcommerceTypes.PaymentResult> =>
  fetchInstance
    .POST(
      '/api/create-checkout-session',
      payload
    )
    .then((res) => res.data)

/**
 * Check Checkout Session.
 *
 * @param {string} sessionId
 * @returns {Promise<number>}
 */
export const checkCheckoutSession = async (sessionId: string): Promise<number> =>
  fetchInstance
    .POST(
      `/api/check-checkout-session/${sessionId}`,
      null,
      [],
      true
    )
    .then((res) => res.status)

/**
 * Create Payment Intent.
 *
 * @param {wexcommerceTypes.CreatePaymentPayload} payload
 * @returns {Promise<wexcommerceTypes.CreatePaymentIntentResult>}
 */
export const createPaymentIntent = async (payload: wexcommerceTypes.CreatePaymentPayload): Promise<wexcommerceTypes.PaymentResult> =>
  fetchInstance
    .POST(
      '/api/create-payment-intent',
      payload
    )
    .then((res) => res.data)
