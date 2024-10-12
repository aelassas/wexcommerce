'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Update an order.
 *
 * @param {string} userId
 * @param {string} orderId
 * @param {wexcommerceTypes.OrderStatus} status
 * @returns {Promise<number>}
 */
export const updateOrder = async (userId: string, orderId: string, status: wexcommerceTypes.OrderStatus): Promise<number> => {
  const data: wexcommerceTypes.UpdateOrderPayload = { status }

  return fetchInstance
    .PUT(
      `/api/update-order/${userId}/${orderId}`,
      data,
      [await UserService.authHeader()],
      true,
    )
    .then((res) => res.status)
}

/**
 * Delete an order.
 *
 * @param {string} userId
 * @param {string} orderId
 * @returns {Promise<number>}
 */
export const deleteOrder = async (userId: string, orderId: string): Promise<number> =>
  fetchInstance
    .DELETE(`/api/delete-order/${userId}/${orderId}`,
      [await UserService.authHeader()]
    )
    .then((res) => res.status)

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
export const getOrders = async (
  userId: string,
  page: number,
  size: number,
  keyword: string,
  paymentTypes: wexcommerceTypes.PaymentType[],
  deliveryTypes: wexcommerceTypes.DeliveryType[],
  statuses: wexcommerceTypes.OrderStatus[],
  sortBy: wexcommerceTypes.SortOrderBy = wexcommerceTypes.SortOrderBy.dateDesc,
  from?: number,
  to?: number,
): Promise<wexcommerceTypes.Result<wexcommerceTypes.OrderInfo>> => {
  const data: wexcommerceTypes.GetOrdersPayload = {
    paymentTypes,
    deliveryTypes,
    statuses,
    from: from || null,
    to: to || null,
    sortBy,
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
 * Get order by id.
 *
 * @async
 * @param {string} orderId
 * @returns {Promise<wexcommerceTypes.Response<wexcommerceTypes.OrderInfo>>}
 */
export const getOrder = async (orderId: string): Promise<wexcommerceTypes.Response<wexcommerceTypes.OrderInfo>> => {
  return fetchInstance
    .GET(
      `/api/order/${orderId}`,
      [await UserService.authHeader()]
    )
    .then((res) => ({ status: res.status, data: res.data }))
}
