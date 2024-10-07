'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'

/**
 * Create Checkout Session.
 *
 * @param {wexcommerceTypes.CreatePaymentPayload} payload
 * @returns {Promise<wexcommerceTypes.PaymentResult>}
 */
export const createCheckoutSession = (payload: wexcommerceTypes.CreatePaymentPayload): Promise<wexcommerceTypes.PaymentResult> =>
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
export const checkCheckoutSession = (sessionId: string): Promise<number> =>
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
export const createPaymentIntent = (payload: wexcommerceTypes.CreatePaymentPayload): Promise<wexcommerceTypes.PaymentResult> =>
  fetchInstance
    .POST(
      '/api/create-payment-intent',
      payload
    )
    .then((res) => res.data)
