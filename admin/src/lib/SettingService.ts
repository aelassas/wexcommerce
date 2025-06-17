'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import * as UserService from './UserService'

/**
 * Get current language.
 *
 * @returns {Promise<string>}
 */
export const getLanguage = async (): Promise<string> =>
  fetchInstance
    .GET(
      '/api/language'
    )
    .then((res) => res.data)

/**
 * Get current currency.
 *
 * @returns {Promise<string>}
 */
export const getCurrency = async (): Promise<string> =>
  fetchInstance
    .GET(
      '/api/currency'
    )
    .then((res) => res.data)

/**
 * Get settings.
 *
 * @returns {Promise<wexcommerceTypes.Setting>}
 */
export const getSettings = async (): Promise<wexcommerceTypes.Setting> =>
  fetchInstance
    .GET(
      '/api/settings',
      [await UserService.authHeader()]
    )
    .then((res) => res.data)

/**
 * Update settings.
 *
 * @param {wexcommerceTypes.UpdateSettingsPayload} data
 * @returns {Promise<number>}
 */
export const updateSettings = async (data: wexcommerceTypes.UpdateSettingsPayload): Promise<number> =>
  fetchInstance
    .PUT(
      '/api/update-settings',
      data,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)

/**
 * Update bank settings.
 *
 * @param {wexcommerceTypes.UpdateBankSettingsPayload} data
 * @returns {Promise<number>}
 */
export const updateBankSettings = async (data: wexcommerceTypes.UpdateBankSettingsPayload): Promise<number> =>
  fetchInstance
    .PUT(
      '/api/update-bank-settings',
      data,
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
