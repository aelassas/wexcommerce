'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

export const getDeliveryTypes = async (): Promise<wexcommerceTypes.DeliveryTypeInfo[]> => (
  fetchInstance
    .GET(
      '/api/delivery-types',
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
)

/**
 * Update delivery types.
 *
 * @param {wexcommerceTypes.UpdateDeliveryTypesPayload} data
 * @returns {Promise<number>}
 */
export const updateDeliveryTypes = async (data: wexcommerceTypes.UpdateDeliveryTypesPayload): Promise<number> => (
  fetchInstance
    .PUT(
      '/api/update-delivery-types',
      data,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)
