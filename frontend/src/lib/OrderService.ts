'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Checkout.
 *
 * @param {wexcommerceTypes.User} user
 * @param {wexcommerceTypes.OrderInfo} order
 * @returns {Promise<number>}
 */
export const checkout = async (data: wexcommerceTypes.CheckoutPayload): Promise<{ status: number, orderId: string }> => (
  fetchInstance
    .POST(
      '/api/checkout',
      data,
      [],
    )
    .then((res) => ({ status: res.status, orderId: res.data.orderId }))
)

/**
 * Get orders.
 *
 * @param {string} userId
 * @param {number} page
 * @param {number} size
 * @param {string} keyword
 * @param {wexcommerceTypes.PaymentType[]} paymentTypes
 * @param {wexcommerceTypes.DeliveryType[]} deliveryTypes
 * @param {wexcommerceTypes.OrderStatus[]} statuses
 * @param {?number} [from]
 * @param {?number} [to]
 * @returns {Promise<wexcommerceTypes.Result<wexcommerceTypes.OrderInfo>>}
 */
export const getOrders = async (userId: string, page: number, size: number, keyword: string, paymentTypes: wexcommerceTypes.PaymentType[], deliveryTypes: wexcommerceTypes.DeliveryType[], statuses: wexcommerceTypes.OrderStatus[], from?: number, to?: number): Promise<wexcommerceTypes.Result<wexcommerceTypes.OrderInfo>> => {
  const data: wexcommerceTypes.GetOrdersPayload = {
    paymentTypes,
    deliveryTypes,
    statuses,
    from: from || null,
    to: to || null
  }

  return fetchInstance
    .POST(
      `/api/orders/${userId}/${page}/${size}/?s=${encodeURIComponent(keyword || '')}`,
      data,
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
}

/**
 * Delete temporary Order created from checkout session.
 *
 * @param {string} orderId
 * @param {string} sessionId
 * @returns {Promise<number>}
 */
export const deleteTempOrder = (orderId: string, sessionId: string): Promise<number> =>
  fetchInstance
    .DELETE(
      `/api/delete-temp-order/${orderId}/${sessionId}`,
      [],
      true,
    )
    .then((res) => res.status)
