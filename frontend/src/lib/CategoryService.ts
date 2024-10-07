'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'

/**
 * Get categories.
 *
 * @param {string} language
 * @returns {Promise<wexcommerceTypes.CategoryInfo[]>}
 */
export const getCategories = async (language: string, imageRequired: boolean): Promise<wexcommerceTypes.CategoryInfo[]> => (
  fetchInstance.GET(
    `/api/categories/${language}/${imageRequired}`
  )
    .then((res) => res.data)
)

/**
 * Get featured categories with products.
 *
 * @async
 * @param {string} language
 * @param {number} size
 * @param {string} cartId
 * @returns {Promise<wexcommerceTypes.CategoryInfo[]>}
 */
export const getFeaturedCategories = async (language: string, size: number, cartId: string): Promise<wexcommerceTypes.FeaturedCategory[]> => (
  fetchInstance.GET(
    `/api/featured-categories/${language}/${size}?c=${cartId}`
  )
    .then((res) => res.data)
)
