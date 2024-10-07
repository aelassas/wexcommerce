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
      '/api/enabled-payment-types',
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
