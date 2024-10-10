'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'

/**
 * Get product.
 *
 * @param {string} id
 * @param {string} language
 * @param {string} cartId
 * @returns {Promise<wexcommerceTypes.Product>}
 */
export const getProduct = async (id: string, language: string, cartId: string, wishlistId: string): Promise<wexcommerceTypes.Product> => {
  const data: wexcommerceTypes.GetProductPayload = { cart: cartId, wishlist: wishlistId }

  return fetchInstance
    .POST(
      `/api/product/${id}/${language}`,
      data,
    )
    .then((res) => res.data)
}

/**
 * Get products.
 *
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @param {string} categoryId
 * @param {string} cartId
 * @returns {Promise<wexcommerceTypes.Result<wexcommerceTypes.Product>>}
 */
export const getProducts = async (
  keyword: string,
  page: number,
  size: number,
  categoryId: string,
  cartId: string,
  wishlistId: string,
): Promise<wexcommerceTypes.Result<wexcommerceTypes.Product>> => {
  const data: wexcommerceTypes.GetProductsPayload = { cart: cartId, wishlist: wishlistId }

  return fetchInstance
    .POST(
      `/api/frontend-products/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}${(keyword !== '' && `?s=${encodeURIComponent(keyword)}` || '')}`,
      data,
    )
    .then((res) => res.data)
}

export const getFeaturedProducts = async (
  size: number,
  cartId: string
): Promise<wexcommerceTypes.Product[]> => {
  const data: wexcommerceTypes.GetProductsPayload = { cart: cartId, size }

  return fetchInstance
    .POST(
      '/api/featured-products/',
      data,
    )
    .then((res) => res.data)
}
