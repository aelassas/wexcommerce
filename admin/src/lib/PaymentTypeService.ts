'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Get all payment types.
 *
 * @returns {*}
 */
export const getPaymentTypes = async (): Promise<wexcommerceTypes.PaymentTypeInfo[]> =>
  fetchInstance
    .GET(
      '/api/payment-types',
      [await UserService.authHeader()]
    )
    .then((res) => res.data)

/**
 * Update payment types
 *
 * @param {*} data
 * @returns {*}
 */
export const updatePaymentTypes = async (data: wexcommerceTypes.UpdatePaymentTypesPayload): Promise<number> =>
  fetchInstance
    .PUT(
      '/api/update-payment-types',
      data,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
