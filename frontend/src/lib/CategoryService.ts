'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'

/**
 * Get categories.
 *
 * @param {string} language
 * @returns {Promise<wexcommerceTypes.CategoryInfo[]>}
 */
export const getCategories = async (language: string): Promise<wexcommerceTypes.CategoryInfo[]> => (
  fetchInstance.GET(
    `/api/categories/${language}`
  )
    .then((res) => res.data)
)
