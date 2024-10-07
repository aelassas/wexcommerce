'use client'

import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Upload product image.
 *
 * @param {Blob} file
 * @returns {Promise<string>}
 */
export const uploadProductImage = async (file: Blob): Promise<string> => {
  const user = await UserService.getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return fetchInstance
    .POST(
      `/api/upload-image`,
      formData,
      user && user.accessToken ?
        [{ 'x-access-token': user.accessToken }, { 'Content-Type': 'multipart/form-data' }]
        : [{ 'Content-Type': 'multipart/form-data' }],
      false,
      true,
    )
    .then((res) => res.data)
}

/**
 * Create category image.
 *
 * @param {Blob} file
 * @returns {Promise<string>}
 */
export const createCategoryImage = async (file: Blob): Promise<string> => {
  const user = await UserService.getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return fetchInstance
    .POST(
      `/api/create-category-image`,
      formData,
      user && user.accessToken ?
        [{ 'x-access-token': user.accessToken }, { 'Content-Type': 'multipart/form-data' }]
        : [{ 'Content-Type': 'multipart/form-data' }],
      false,
      true,
    )
    .then((res) => res.data)
}

/**
 * Create category image.
 *
 * @param {Blob} file
 * @returns {Promise<string>}
 */
export const updateCategoryImage = async (id: string, file: Blob): Promise<string> => {
  const user = await UserService.getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return fetchInstance
    .POST(
      `/api/update-category-image/${encodeURIComponent(id)}`,
      formData,
      user && user.accessToken ?
        [{ 'x-access-token': user.accessToken }, { 'Content-Type': 'multipart/form-data' }]
        : [{ 'Content-Type': 'multipart/form-data' }],
      false,
      true,
    )
    .then((res) => res.data)
}
