'use server'

import { cookies } from 'next/headers'
import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import { CookieOptions } from '@/config/env.config'
import * as UserService from './UserService'

/**
 * Add item to cart.
 *
 * @param {string} cartId
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<wexcommerceTypes.Response<string>>}
 */
export const addItem = async (cartId: string, userId: string, productId: string): Promise<wexcommerceTypes.Response<string>> => {
  const data: wexcommerceTypes.AddItemPayload = { cartId, userId, productId }

  return fetchInstance
    .POST(
      '/api/add-cart-item',
      data
    )
    .then((res) => ({ status: res.status, data: res.data }))
}

/**
 * Update cart item quantity.
 *
 * @param {string} cartItemId
 * @param {string} quantity
 * @returns {Promise<number>}
 */
export const updateQuantity = async (cartItemId: string, quantity: number): Promise<number> => (
  fetchInstance
    .PUT(
      `/api/update-cart-item/${cartItemId}/${quantity}`,
      null,
      [],
      true
    )
    .then((res) => res.status)
)

/**
 * Delete cart item.
 *
 * @param {string} cartId
 * @param {string} productId
 * @returns {Promise<wexcommerceTypes.Response<{ cartDeleted: boolean }>>}
 */
export const deleteItem = async (cartId: string, productId: string): Promise<wexcommerceTypes.Response<{ cartDeleted: boolean, quantity: number }>> => (
  fetchInstance
    .DELETE(
      `/api/delete-cart-item/${cartId}/${productId}`
    )
    .then((res) => ({ status: res.status, data: res.data }))
)

/**
 * Clear cart.
 *
 * @param {string} cartId
 * @returns {Promise<number>}
 */
export const clearCart = async (cartId?: string): Promise<number> => (
  fetchInstance
    .DELETE(
      `/api/delete-cart/${cartId || (await getCartId())}`,
      [],
      true
    )
    .then((res) => res.status)
)

/**
 * Get cart.
 *
 * @param {string} cartId
 * @returns {Promise<wexcommerceTypes.Cart>}
 */
export const getCart = async (cartId: string): Promise<wexcommerceTypes.Cart> => (
  fetchInstance
    .GET(
      `/api/cart/${cartId}`
    )
    .then((res) => res.data)
)

/**
 * Get cart count.
 *
 * @param {string} cartId
 * @returns {Promise<number>}
 */
export const getCartCount = async (cartId?: string): Promise<number> => {
  cartId = await getCartId()
  if (cartId) {
    const res = await fetchInstance
      .GET(
        `/api/cart-count/${cartId}`,
      )
    return res.data
  }

  return 0
}

/**
 * Set cart id.
 *
 * @param {string} id
 */
export const setCartId = async (id: string) => {
  (await cookies()).set('wc-fe-cart', id, CookieOptions)
}

/**
 * Get cart id.
 *
 * @returns {string}
 */
export const getCartId = async () => (await cookies()).get('wc-fe-cart')?.value || ''

/**
 * Delete cart id.
 *
 * @async
 * @returns {*}
 */
export const deleteCartId = async () => {
  (await cookies()).delete('wc-fe-cart')
}

/**
 * Get user's cart id.
 *
 * @async
 * @param {string} userId
 * @returns {Promise<string>}
 */
export const getUserCartId = async (userId: string): Promise<string> => (
  fetchInstance
    .GET(
      `/api/cart-id/${userId}`,
      [await UserService.authHeader()]
    )
    .then((res) => res.data || '')
)

/**
 * Update cart user.
 *
 * @async
 * @param {string} cartId
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const updateCart = async (cartId: string, userId: string): Promise<number> => (
  fetchInstance
    .PUT(
      `/api/update-cart/${cartId}/${userId}`,
      null,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Check if cart is in db.
 *
 * @async
 * @param {string} cartId
 * @returns {Promise<number>}
 */
export const checkCart = async (cartId: string): Promise<number> => (
  fetchInstance
    .GET(
      `/api/check-cart/${cartId}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Clear other carts.
 *
 * @async
 * @param {string} cartId
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const clearOtherCarts = async (cartId: string, userId: string): Promise<number> => (
  fetchInstance
    .DELETE(
      `/api/clear-other-carts/${cartId}/${userId}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)
