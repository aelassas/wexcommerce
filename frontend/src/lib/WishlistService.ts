'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Add item to wishlist.
 *
 * @param {string} wishlistId
 * @param {string} userId
 * @param {string} productId
 * @returns {Promise<wexcommerceTypes.Response<string>>}
 */
export const addItem = async (wishlistId: string, userId: string, productId: string): Promise<wexcommerceTypes.Response<string>> => {
  const data: wexcommerceTypes.AddWishlistItemPayload = { wishlistId, userId, productId }

  return fetchInstance
    .POST(
      '/api/add-wishlist-item',
      data,
      [await UserService.authHeader()],
    )
    .then((res) => ({ status: res.status, data: res.data }))
}

/**
 * Delete wishlist item.
 *
 * @param {string} wishlistId
 * @param {string} productId
 * @returns {Promise<wexcommerceTypes.Response<{ wishlistDeleted: boolean }>>}
 */
export const deleteItem = async (wishlistId: string, productId: string): Promise<number> => (
  fetchInstance
    .DELETE(
      `/api/delete-wishlist-item/${wishlistId}/${productId}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Clear wishlist.
 *
 * @param {string} wishlistId
 * @returns {Promise<number>}
 */
export const clearWishlist = async (wishlistId: string): Promise<number> => (
  fetchInstance
    .DELETE(
      `/api/clear-wishlist/${wishlistId}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Get wishlist.
 *
 * @param {string} wishlistId
 * @returns {Promise<wexcommerceTypes.Wishlist>}
 */
export const getWishlist = async (wishlistId: string): Promise<wexcommerceTypes.Wishlist> => (
  fetchInstance
    .GET(
      `/api/wishlist/${wishlistId}`,
      [await UserService.authHeader()],
    )
    .then((res) => res.data)
)

/**
 * Get wishlist count.
 *
 * @param {string} wishlistId
 * @returns {Promise<number>}
 */
export const getWishlistCount = async (wishlistId?: string): Promise<number> => {
  if (wishlistId) {
    const res = await fetchInstance
      .GET(
        `/api/wishlist-count/${wishlistId}`,
        [await UserService.authHeader()],
      )
    return res.data
  }

  return 0
}

/**
 * Get user's wishlist id.
 *
 * @async
 * @param {string} userId
 * @returns {Promise<string>}
 */
export const getWishlistId = async (userId: string): Promise<string> => (
  userId ?
    fetchInstance
      .GET(
        `/api/wishlist-id/${userId}`,
        [await UserService.authHeader()]
      )
      .then((res) => res.data)
    : ''
)

/**
 * Update user's wishlist.
 *
 * @async
 * @param {string} wishlistId
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const updateWishlist = async (wishlistId: string, userId: string): Promise<number> => (
  fetchInstance
    .PUT(
      `/api/update-wishlist/${wishlistId}/${userId}`,
      null,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Check user's wishlist.
 *
 * @async
 * @param {string} wishlistId
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const checkWishlist = async (wishlistId: string, userId: string): Promise<number> => (
  fetchInstance
    .GET(
      `/api/check-wishlist/${wishlistId}/${userId}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)
