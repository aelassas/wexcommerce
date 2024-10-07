'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

export const getDeliveryTypes = async (): Promise<wexcommerceTypes.DeliveryTypeInfo[]> => (
  fetchInstance
    .GET(
      '/api/enabled-delivery-types',
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
)
