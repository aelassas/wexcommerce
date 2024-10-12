'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Delete temp image.
 *
 * @param {string} fileName
 * @returns {Promise<number>}
 */
export const deleteTempImage = async (fileName: string): Promise<number> =>
  fetchInstance
    .POST(
      `/api/delete-temp-image/${encodeURIComponent(fileName)}`,
      null,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Delete product image.
 *
 * @param {string} productId
 * @param {string} fileName
 * @returns {Promise<number>}
 */
export const deleteImage = async (productId: string, fileName: string): Promise<number> =>
  fetchInstance
    .POST(
      `/api/delete-image/${productId}/${encodeURIComponent(fileName)}`,
      null,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Create a product.
 *
 * @param {wexcommerceTypes.CreateProductPayload} data
 * @returns {Promise<number>}
 */
export const createProduct = async (data: wexcommerceTypes.CreateProductPayload): Promise<wexcommerceTypes.Response<wexcommerceTypes.Product>> =>
  fetchInstance
    .POST(
      `/api/create-product`,
      data,
      [await UserService.authHeader()]
    )
    .then((res) => ({ status: res.status, data: res.data }))

/**
 * Update a product.
 *
 * @param {wexcommerceTypes.UpdateProductPayload} data
 * @returns {Promise<number>}
 */
export const updateProduct = async (data: wexcommerceTypes.UpdateProductPayload): Promise<number> =>
  fetchInstance
    .PUT(
      `/api/update-product`,
      data,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Check if a product is related to an order.
 *
 * @param {string} id
 * @returns {Promise<number>}
 */
export const checkProduct = async (id: string): Promise<number> =>
  fetchInstance
    .GET(
      `/api/check-product/${id}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Delete a product.
 *
 * @param {string} id
 * @returns {Promise<number>}
 */
export const deleteProduct = async (id: string): Promise<number> =>
  fetchInstance
    .DELETE(
      `/api/delete-product/${id}`,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Get a product.
 *
 * @param {string} id
 * @param {string} language
 * @returns {Promise<wexcommerceTypes.Product>}
 */
export const getProduct = async (id: string, language: string): Promise<wexcommerceTypes.Product> =>
  fetchInstance
    .POST(
      `/api/product/${id}/${language}`
    )
    .then((res) => res.data)

/**
 * Get products.
 *
 * @param {string} userId
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @param {string} categoryId
 * @returns {Promise<wexcommerceTypes.Result<wexcommerceTypes.Product>>}
 */
export const getProducts = async (
  userId: string,
  keyword: string,
  page: number,
  size: number,
  categoryId: string,
  orderBy: wexcommerceTypes.ProductOrderBy = wexcommerceTypes.ProductOrderBy.featured
): Promise<wexcommerceTypes.Result<wexcommerceTypes.Product>> => {
  const data: wexcommerceTypes.GetBackendProductsPayload = { orderBy }

  return fetchInstance
    .POST(
      `/api/backend-products/${userId}/${page}/${size}/${(categoryId && `${categoryId}/`) || ''}?s=${encodeURIComponent(keyword || '')}`
      , data
      , [await UserService.authHeader()]
    )
    .then((res) => res.data)
}
